
import { logger } from '../loggerService';

export interface RateLimitRule {
  windowMs: number;
  maxRequests: number;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

export interface RateLimitAttempt {
  timestamp: number;
  success: boolean;
  clientId: string;
  endpoint: string;
}

class RateLimiter {
  private static instance: RateLimiter;
  private attempts: Map<string, RateLimitAttempt[]> = new Map();
  private rules: Map<string, RateLimitRule> = new Map();

  static getInstance(): RateLimiter {
    if (!RateLimiter.instance) {
      RateLimiter.instance = new RateLimiter();
    }
    return RateLimiter.instance;
  }

  constructor() {
    this.initializeDefaultRules();
    this.startCleanupTask();
  }

  private initializeDefaultRules(): void {
    // Default rate limiting rules
    this.rules.set('login', {
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: 5
    });

    this.rules.set('signup', {
      windowMs: 60 * 60 * 1000, // 1 hour
      maxRequests: 3
    });

    this.rules.set('api', {
      windowMs: 60 * 1000, // 1 minute
      maxRequests: 100
    });

    this.rules.set('search', {
      windowMs: 60 * 1000, // 1 minute
      maxRequests: 50
    });
  }

  private startCleanupTask(): void {
    // Clean up old attempts every 5 minutes
    setInterval(() => {
      this.cleanupOldAttempts();
    }, 5 * 60 * 1000);
  }

  isAllowed(clientId: string, endpoint: string): boolean {
    const rule = this.rules.get(endpoint);
    if (!rule) {
      logger.warn('No rate limit rule found for endpoint', { endpoint }, 'RateLimiter');
      return true;
    }

    const key = `${clientId}:${endpoint}`;
    const attempts = this.attempts.get(key) || [];
    const now = Date.now();
    const windowStart = now - rule.windowMs;

    // Filter attempts within the current window
    const recentAttempts = attempts.filter(attempt => attempt.timestamp > windowStart);

    // Update the attempts list
    this.attempts.set(key, recentAttempts);

    return recentAttempts.length < rule.maxRequests;
  }

  recordAttempt(clientId: string, endpoint: string, success: boolean): void {
    const key = `${clientId}:${endpoint}`;
    const attempts = this.attempts.get(key) || [];
    
    attempts.push({
      timestamp: Date.now(),
      success,
      clientId,
      endpoint
    });

    this.attempts.set(key, attempts);
  }

  getResetTime(clientId: string, endpoint: string): number | null {
    const rule = this.rules.get(endpoint);
    if (!rule) return null;

    const key = `${clientId}:${endpoint}`;
    const attempts = this.attempts.get(key) || [];
    
    if (attempts.length === 0) return null;

    const oldestAttempt = Math.min(...attempts.map(a => a.timestamp));
    return oldestAttempt + rule.windowMs;
  }

  private cleanupOldAttempts(): void {
    const now = Date.now();
    
    for (const [key, attempts] of this.attempts.entries()) {
      const endpoint = key.split(':')[1];
      const rule = this.rules.get(endpoint);
      
      if (rule) {
        const windowStart = now - rule.windowMs;
        const recentAttempts = attempts.filter(attempt => attempt.timestamp > windowStart);
        
        if (recentAttempts.length === 0) {
          this.attempts.delete(key);
        } else {
          this.attempts.set(key, recentAttempts);
        }
      }
    }
  }

  getStats(): RateLimitAttempt[] {
    const allAttempts: RateLimitAttempt[] = [];
    for (const attempts of this.attempts.values()) {
      allAttempts.push(...attempts);
    }
    return allAttempts;
  }

  addRule(endpoint: string, rule: RateLimitRule): void {
    this.rules.set(endpoint, rule);
  }

  removeRule(endpoint: string): void {
    this.rules.delete(endpoint);
  }

  clearAttempts(clientId?: string, endpoint?: string): void {
    if (clientId && endpoint) {
      const key = `${clientId}:${endpoint}`;
      this.attempts.delete(key);
    } else {
      this.attempts.clear();
    }
  }
}

export const rateLimiter = RateLimiter.getInstance();

export function getClientIdentifier(): string {
  // In a browser environment, create a client identifier
  if (typeof window !== 'undefined') {
    let clientId = localStorage.getItem('client_id');
    if (!clientId) {
      clientId = crypto.randomUUID();
      localStorage.setItem('client_id', clientId);
    }
    return clientId;
  }
  
  // Fallback for non-browser environments
  return 'unknown_client';
}

export default rateLimiter;
