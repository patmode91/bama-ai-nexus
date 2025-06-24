import { supabase } from '@/integrations/supabase/client';
import { logger } from '../loggerService';
import { rateLimiter, getClientIdentifier } from './rateLimiter';

export interface LoginAttempt {
  email: string;
  success: boolean;
  timestamp: number;
  ipAddress?: string;
  userAgent?: string;
  reason?: string;
}

export interface SecurityEvent {
  type: 'login' | 'logout' | 'password_change' | 'failed_login' | 'account_locked' | 'suspicious_activity';
  userId?: string;
  metadata: Record<string, any>;
  timestamp: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

class AuthenticationService {
  private static instance: AuthenticationService;
  private loginAttempts: Map<string, LoginAttempt[]> = new Map();
  private securityEvents: SecurityEvent[] = [];
  private readonly MAX_LOGIN_ATTEMPTS = 5;
  private readonly LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

  static getInstance(): AuthenticationService {
    if (!AuthenticationService.instance) {
      AuthenticationService.instance = new AuthenticationService();
    }
    return AuthenticationService.instance;
  }

  async signIn(email: string, password: string): Promise<{ success: boolean; error?: string; user?: any }> {
    const clientId = getClientIdentifier();
    
    // Check rate limiting
    if (!rateLimiter.isAllowed(clientId, 'login')) {
      const resetTime = rateLimiter.getResetTime(clientId, 'login');
      this.recordSecurityEvent({
        type: 'failed_login',
        metadata: { email, reason: 'rate_limited' },
        timestamp: Date.now(),
        severity: 'medium'
      });
      
      return {
        success: false,
        error: `Too many login attempts. Try again after ${new Date(resetTime || Date.now()).toLocaleTimeString()}`
      };
    }

    // Check if account is locked
    if (this.isAccountLocked(email)) {
      this.recordSecurityEvent({
        type: 'failed_login',
        metadata: { email, reason: 'account_locked' },
        timestamp: Date.now(),
        severity: 'high'
      });
      
      return {
        success: false,
        error: 'Account is temporarily locked due to multiple failed login attempts'
      };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        this.recordLoginAttempt(email, false, error.message);
        this.recordSecurityEvent({
          type: 'failed_login',
          metadata: { email, reason: error.message },
          timestamp: Date.now(),
          severity: 'medium'
        });
        
        return { success: false, error: error.message };
      }

      // Clear failed attempts on successful login
      this.clearLoginAttempts(email);
      this.recordLoginAttempt(email, true);
      this.recordSecurityEvent({
        type: 'login',
        userId: data.user?.id,
        metadata: { email },
        timestamp: Date.now(),
        severity: 'low'
      });

      logger.info('User signed in successfully', { userId: data.user?.id }, 'Auth');
      
      return { success: true, user: data.user };
    } catch (error) {
      logger.error('Sign in error', { error, email }, 'Auth');
      this.recordLoginAttempt(email, false, 'Unknown error');
      
      return { success: false, error: 'An unexpected error occurred' };
    }
  }

  async signUp(email: string, password: string, metadata?: Record<string, any>): Promise<{ success: boolean; error?: string }> {
    const clientId = getClientIdentifier();
    
    if (!rateLimiter.isAllowed(clientId, 'signup')) {
      return {
        success: false,
        error: 'Too many signup attempts. Please try again later.'
      };
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata || {}
        }
      });

      if (error) {
        return { success: false, error: error.message };
      }

      this.recordSecurityEvent({
        type: 'login',
        metadata: { email, action: 'signup' },
        timestamp: Date.now(),
        severity: 'low'
      });

      return { success: true };
    } catch (error) {
      logger.error('Sign up error', { error, email }, 'Auth');
      return { success: false, error: 'An unexpected error occurred' };
    }
  }

  async signOut(): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      await supabase.auth.signOut();
      
      if (user) {
        this.recordSecurityEvent({
          type: 'logout',
          userId: user.id,
          metadata: {},
          timestamp: Date.now(),
          severity: 'low'
        });
      }
    } catch (error) {
      logger.error('Sign out error', { error }, 'Auth');
    }
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        return { success: false, error: error.message };
      }

      this.recordSecurityEvent({
        type: 'password_change',
        userId: user.id,
        metadata: {},
        timestamp: Date.now(),
        severity: 'medium'
      });

      return { success: true };
    } catch (error) {
      logger.error('Password change error', { error }, 'Auth');
      return { success: false, error: 'An unexpected error occurred' };
    }
  }

  private recordLoginAttempt(email: string, success: boolean, reason?: string): void {
    const attempts = this.loginAttempts.get(email) || [];
    attempts.push({
      email,
      success,
      timestamp: Date.now(),
      reason
    });

    // Keep only last 10 attempts
    if (attempts.length > 10) {
      attempts.splice(0, attempts.length - 10);
    }

    this.loginAttempts.set(email, attempts);
  }

  private clearLoginAttempts(email: string): void {
    this.loginAttempts.delete(email);
  }

  private isAccountLocked(email: string): boolean {
    const attempts = this.loginAttempts.get(email) || [];
    const recentFailures = attempts.filter(
      attempt => !attempt.success && (Date.now() - attempt.timestamp) < this.LOCKOUT_DURATION
    );

    return recentFailures.length >= this.MAX_LOGIN_ATTEMPTS;
  }

  private recordSecurityEvent(event: SecurityEvent): void {
    this.securityEvents.unshift(event);
    
    // Keep only last 1000 events
    if (this.securityEvents.length > 1000) {
      this.securityEvents = this.securityEvents.slice(0, 1000);
    }

    logger.info('Security event recorded', event, 'Security');
  }

  // Public API for monitoring
  getSecurityEvents(limit = 50): SecurityEvent[] {
    return this.securityEvents.slice(0, limit);
  }

  getLoginAttempts(email: string): LoginAttempt[] {
    return this.loginAttempts.get(email) || [];
  }

  getSecurityStats() {
    const totalEvents = this.securityEvents.length;
    const criticalEvents = this.securityEvents.filter(e => e.severity === 'critical').length;
    const highSeverityEvents = this.securityEvents.filter(e => e.severity === 'high').length;
    const failedLogins = this.securityEvents.filter(e => e.type === 'failed_login').length;

    return {
      totalEvents,
      criticalEvents,
      highSeverityEvents,
      failedLogins,
      activeAccounts: this.loginAttempts.size
    };
  }
}

export const authenticationService = AuthenticationService.getInstance();
export default authenticationService;
