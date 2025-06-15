
import { CacheOptions, CacheItem, CacheStats } from './types';

class AdvancedCacheService {
  private cache: Map<string, CacheItem> = new Map();
  private hitCount = 0;
  private missCount = 0;
  private maxSize = 1000;

  async get<T>(key: string): Promise<T | null> {
    const item = this.cache.get(key);
    
    if (!item) {
      this.missCount++;
      return null;
    }

    if (this.isExpired(item)) {
      this.cache.delete(key);
      this.missCount++;
      return null;
    }

    this.hitCount++;
    item.lastAccessed = Date.now();
    return item.data as T;
  }

  async set<T>(key: string, data: T, options: CacheOptions = {}): Promise<void> {
    const item: CacheItem = {
      data,
      timestamp: Date.now(),
      lastAccessed: Date.now(),
      ttl: options.ttl || 300000, // 5 minutes default
      priority: options.priority || 'medium',
      tags: options.tags || []
    };

    this.cache.set(key, item);
    this.cleanup();
  }

  async memoize<T>(
    key: string, 
    fn: () => Promise<T>, 
    options: CacheOptions = {}
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const result = await fn();
    await this.set(key, result, options);
    return result;
  }

  invalidateByTag(tag: string): void {
    for (const [key, item] of this.cache.entries()) {
      if (item.tags.includes(tag)) {
        this.cache.delete(key);
      }
    }
  }

  clear(): void {
    this.cache.clear();
    this.hitCount = 0;
    this.missCount = 0;
  }

  getStats(): CacheStats {
    const totalRequests = this.hitCount + this.missCount;
    return {
      hitRate: totalRequests > 0 ? this.hitCount / totalRequests : 0,
      size: this.cache.size,
      maxSize: this.maxSize,
      totalHits: this.hitCount,
      totalMisses: this.missCount
    };
  }

  private isExpired(item: CacheItem): boolean {
    return Date.now() - item.timestamp > item.ttl;
  }

  private cleanup(): void {
    if (this.cache.size <= this.maxSize) return;

    // Sort by priority and last accessed time
    const entries = Array.from(this.cache.entries()).sort((a, b) => {
      const priorityOrder = { low: 1, medium: 2, high: 3 };
      const priorityDiff = priorityOrder[a[1].priority] - priorityOrder[b[1].priority];
      if (priorityDiff !== 0) return priorityDiff;
      return a[1].lastAccessed - b[1].lastAccessed;
    });

    // Remove oldest low-priority items
    const itemsToRemove = entries.slice(0, this.cache.size - this.maxSize);
    itemsToRemove.forEach(([key]) => this.cache.delete(key));
  }
}

export const searchCache = new AdvancedCacheService();
