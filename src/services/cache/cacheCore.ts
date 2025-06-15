
import { CacheItem, CacheOptions, CacheStats } from './types';
import { compressData, decompressData, estimateMemoryUsage, shouldCompress } from './cacheUtils';
import { lruEviction, cleanupExpired, isExpired } from './evictionStrategies';

export class CacheCore {
  private cache = new Map<string, CacheItem<any>>();
  private maxSize = 100;
  private compressionThreshold = 1024;
  private stats = {
    hits: 0,
    misses: 0,
    evictions: 0
  };

  async set<T>(key: string, data: T, options: CacheOptions = {}): Promise<void> {
    const {
      ttl = 300000, // 5 minutes default
      priority = 'medium',
      tags = [],
      compress = false
    } = options;

    // Clean up expired entries before adding new ones
    this.cleanup();

    // If cache is full, evict based on priority and access patterns
    if (this.cache.size >= this.maxSize) {
      this.evict();
    }

    let processedData = data;
    let isCompressed = false;

    // Compress large data if enabled
    if (compress && shouldCompress(data, this.compressionThreshold)) {
      try {
        processedData = await compressData(data) as T;
        isCompressed = true;
      } catch (error) {
        console.warn('Compression failed, storing uncompressed:', error);
      }
    }

    const now = Date.now();
    const entry: CacheItem<T> = {
      data: processedData,
      timestamp: now,
      expiresAt: now + ttl,
      accessCount: 0,
      lastAccessed: now,
      priority,
      tags,
      compressed: isCompressed
    };

    this.cache.set(key, entry);
  }

  async get<T>(key: string): Promise<T | null> {
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.stats.misses++;
      return null;
    }

    // Check if entry has expired
    if (isExpired(entry)) {
      this.cache.delete(key);
      this.stats.misses++;
      return null;
    }

    // Update access statistics
    entry.accessCount++;
    entry.lastAccessed = Date.now();
    this.stats.hits++;

    let data = entry.data;

    // Decompress if needed
    if (entry.compressed) {
      try {
        data = await decompressData(data as string) as T;
      } catch (error) {
        console.error('Decompression failed:', error);
        this.cache.delete(key);
        return null;
      }
    }

    return data;
  }

  invalidate(key: string): boolean {
    return this.cache.delete(key);
  }

  invalidateByTag(tag: string): number {
    let count = 0;
    
    for (const [key, entry] of this.cache.entries()) {
      if (entry.tags.includes(tag)) {
        this.cache.delete(key);
        count++;
      }
    }
    
    return count;
  }

  clear(): void {
    this.cache.clear();
    this.stats = { hits: 0, misses: 0, evictions: 0 };
  }

  cleanup(): void {
    cleanupExpired(this.cache);
  }

  getStats(): CacheStats {
    const entries = Array.from(this.cache.values());
    const totalRequests = this.stats.hits + this.stats.misses;
    
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRate: totalRequests > 0 ? this.stats.hits / totalRequests : 0,
      memoryUsage: estimateMemoryUsage(this.cache),
      expiredEntries: entries.filter(entry => isExpired(entry)).length,
      entriesByPriority: {
        high: entries.filter(e => e.priority === 'high').length,
        normal: entries.filter(e => e.priority === 'medium').length,
        low: entries.filter(e => e.priority === 'low').length
      },
      hits: this.stats.hits,
      misses: this.stats.misses,
      totalRequests,
      evictions: this.stats.evictions
    };
  }

  private evict(): void {
    // Simple LRU eviction with priority consideration
    const evictionCount = Math.max(1, Math.floor(this.maxSize * 0.1)); // Remove 10% of cache
    lruEviction(this.cache, evictionCount);
    this.stats.evictions += evictionCount;
  }
}
