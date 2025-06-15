
import { CacheItem, CacheOptions, CacheStats } from './types';

class AdvancedCacheService {
  private cache = new Map<string, CacheItem>();
  private maxSize = 1000;
  private stats = {
    hits: 0,
    misses: 0,
    evictions: 0,
    totalHits: 0,
    totalMisses: 0
  };

  set<T>(key: string, data: T, options: CacheOptions = {}): void {
    const ttl = options.ttl || 300000; // 5 minutes default
    const now = Date.now();
    
    const item: CacheItem<T> = {
      data,
      timestamp: now,
      lastAccessed: now,
      ttl,
      priority: options.priority || 'medium',
      tags: options.tags || [],
      accessCount: 0,
      compressed: options.compress || false,
      expiresAt: now + ttl
    };

    if (this.cache.size >= this.maxSize) {
      this.evictLRU();
    }

    this.cache.set(key, item);
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key) as CacheItem<T> | undefined;
    
    if (!item) {
      this.stats.misses++;
      this.stats.totalMisses++;
      return null;
    }

    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      this.stats.misses++;
      this.stats.totalMisses++;
      return null;
    }

    item.lastAccessed = Date.now();
    item.accessCount++;
    this.stats.hits++;
    this.stats.totalHits++;
    
    return item.data;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  has(key: string): boolean {
    const item = this.cache.get(key);
    if (!item) return false;
    
    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
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
      this.stats.evictions++;
    }
  }

  getStats(): CacheStats {
    const totalRequests = this.stats.totalHits + this.stats.totalMisses;
    const expiredCount = Array.from(this.cache.values()).filter(
      item => Date.now() > item.expiresAt
    ).length;

    return {
      hitRate: totalRequests > 0 ? this.stats.totalHits / totalRequests : 0,
      size: this.cache.size,
      maxSize: this.maxSize,
      totalHits: this.stats.totalHits,
      totalMisses: this.stats.totalMisses,
      totalRequests,
      hits: this.stats.hits,
      misses: this.stats.misses,
      evictions: this.stats.evictions,
      memoryUsage: this.cache.size * 1024, // Rough estimate
      expiredEntries: expiredCount
    };
  }
}

export const advancedCacheService = new AdvancedCacheService();
export default advancedCacheService;
