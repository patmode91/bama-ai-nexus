
interface RateLimitRule {
  windowMs: number;
  maxRequests: number;
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private limits: Map<string, RateLimitEntry> = new Map();
  private rules: Map<string, RateLimitRule> = new Map();

  constructor() {
    // Default rate limit rules
    this.addRule('api', { windowMs: 60000, maxRequests: 100 }); // 100 requests per minute
    this.addRule('search', { windowMs: 60000, maxRequests: 60 }); // 60 searches per minute
    this.addRule('login', { windowMs: 900000, maxRequests: 5 }); // 5 login attempts per 15 minutes
    this.addRule('signup', { windowMs: 3600000, maxRequests: 3 }); // 3 signups per hour
    this.addRule('contact', { windowMs: 3600000, maxRequests: 5 }); // 5 contact submissions per hour

    // Clean up expired entries every 5 minutes
    setInterval(() => this.cleanup(), 300000);
  }

  addRule(action: string, rule: RateLimitRule) {
    this.rules.set(action, rule);
  }

  isAllowed(identifier: string, action: string): boolean {
    const rule = this.rules.get(action);
    if (!rule) return true; // No rule means no limit

    const key = `${action}:${identifier}`;
    const now = Date.now();
    const entry = this.limits.get(key);

    if (!entry || now > entry.resetTime) {
      // First request or window has expired
      this.limits.set(key, {
        count: 1,
        resetTime: now + rule.windowMs
      });
      return true;
    }

    if (entry.count >= rule.maxRequests) {
      return false; // Rate limit exceeded
    }

    // Increment count
    entry.count += 1;
    this.limits.set(key, entry);
    return true;
  }

  getRemainingRequests(identifier: string, action: string): number {
    const rule = this.rules.get(action);
    if (!rule) return Infinity;

    const key = `${action}:${identifier}`;
    const entry = this.limits.get(key);
    
    if (!entry || Date.now() > entry.resetTime) {
      return rule.maxRequests;
    }

    return Math.max(0, rule.maxRequests - entry.count);
  }

  getResetTime(identifier: string, action: string): number | null {
    const key = `${action}:${identifier}`;
    const entry = this.limits.get(key);
    
    if (!entry || Date.now() > entry.resetTime) {
      return null;
    }

    return entry.resetTime;
  }

  cleanup() {
    const now = Date.now();
    for (const [key, entry] of this.limits.entries()) {
      if (now > entry.resetTime) {
        this.limits.delete(key);
      }
    }
  }

  // Get rate limiting stats
  getStats(): { action: string; activeKeys: number; rule: RateLimitRule }[] {
    const stats: { action: string; activeKeys: number; rule: RateLimitRule }[] = [];
    
    for (const [action, rule] of this.rules.entries()) {
      const activeKeys = Array.from(this.limits.keys())
        .filter(key => key.startsWith(`${action}:`))
        .filter(key => {
          const entry = this.limits.get(key);
          return entry && Date.now() <= entry.resetTime;
        }).length;
      
      stats.push({ action, activeKeys, rule });
    }
    
    return stats;
  }

  // Reset limits for a specific identifier and action
  reset(identifier: string, action?: string) {
    if (action) {
      const key = `${action}:${identifier}`;
      this.limits.delete(key);
    } else {
      // Reset all actions for this identifier
      for (const key of this.limits.keys()) {
        if (key.includes(`:${identifier}`)) {
          this.limits.delete(key);
        }
      }
    }
  }
}

export const rateLimiter = new RateLimiter();

// Helper function to get client identifier
export const getClientIdentifier = (): string => {
  if (typeof window === 'undefined') return 'server';
  
  // In a real app, you might use user ID, session ID, or IP address
  // For demo purposes, we'll use a combination of user agent and a stored session ID
  let sessionId = localStorage.getItem('rate_limit_session');
  if (!sessionId) {
    sessionId = Math.random().toString(36).substring(2, 15);
    localStorage.setItem('rate_limit_session', sessionId);
  }
  
  return sessionId;
};
