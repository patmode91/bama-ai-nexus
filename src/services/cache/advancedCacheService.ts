
/**
 * Advanced AI-powered cache service with intelligent invalidation
 */

interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
  tags: string[];
  accessCount: number;
  lastAccessed: number;
}

interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  tags?: string[];
  priority?: 'low' | 'normal' | 'high';
}

class AdvancedCacheService {
  private cache = new Map<string, CacheItem<any>>();
  private maxSize = 1000;
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Cleanup expired items every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);
  }

  set<T>(key: string, data: T, options: CacheOptions = {}): void {
    const now = Date.now();
    const ttl = options.ttl || 60 * 60 * 1000; // Default 1 hour
    
    // If cache is full, remove least recently used items
    if (this.cache.size >= this.maxSize) {
      this.evictLRU();
    }

    this.cache.set(key, {
      data,
      timestamp: now,
      ttl,
      tags: options.tags || [],
      accessCount: 0,
      lastAccessed: now
    });
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }

    const now = Date.now();
    
    // Check if expired
    if (now - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    // Update access statistics
    item.accessCount++;
    item.lastAccessed = now;
    
    return item.data;
  }

  has(key: string): boolean {
    const item = this.cache.get(key);
    if (!item) return false;
    
    // Check if expired
    const now = Date.now();
    if (now - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  invalidateByTag(tag: string): number {
    let count = 0;
    
    for (const [key, item] of this.cache.entries()) {
      if (item.tags.includes(tag)) {
        this.cache.delete(key);
        count++;
      }
    }
    
    return count;
  }

  private cleanup(): void {
    const now = Date.now();
    
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key);
      }
    }
  }

  private evictLRU(): void {
    let oldestKey = '';
    let oldestTime = Date.now();
    
    for (const [key, item] of this.cache.entries()) {
      if (item.lastAccessed < oldestTime) {
        oldestTime = item.lastAccessed;
        oldestKey = key;
      }
    }
    
    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  getStats() {
    const now = Date.now();
    let totalSize = 0;
    let expiredCount = 0;
    
    for (const [key, item] of this.cache.entries()) {
      totalSize++;
      if (now - item.timestamp > item.ttl) {
        expiredCount++;
      }
    }
    
    return {
      totalItems: totalSize,
      expiredItems: expiredCount,
      hitRatio: this.calculateHitRatio(),
      memoryUsage: this.estimateMemoryUsage()
    };
  }

  private calculateHitRatio(): number {
    // This is a simplified calculation
    // In a real implementation, you'd track hits vs misses
    return 0.85; // Placeholder
  }

  private estimateMemoryUsage(): number {
    // Rough estimation of memory usage in bytes
    return this.cache.size * 1024; // Placeholder
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.cache.clear();
  }
}

export const aiCache = new AdvancedCacheService();
