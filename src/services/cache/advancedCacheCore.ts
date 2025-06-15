
import { CacheItem, CacheOptions, CacheStats } from './types';
import { compressData, decompressData, estimateMemoryUsage } from './cacheUtils';
import { lruEviction, cleanupExpired } from './evictionStrategies';

export class AdvancedCacheCore {
  private cache = new Map<string, CacheItem<any>>();
  private maxSize = 1000;
  private maxMemoryMB = 50;
  private stats: CacheStats = { 
    hits: 0, 
    misses: 0, 
    size: 0, 
    memoryUsage: 0, 
    hitRate: 0, 
    totalRequests: 0, 
    evictions: 0 
  };
  private compressionEnabled = true;

  async set<T>(key: string, data: T, options: CacheOptions = {}): Promise<void> {
    const now = Date.now();
    const ttl = options.ttl || 5 * 60 * 1000; // 5 minutes default
    
    let processedData: any = data;
    let compressed = false;

    // Compress large objects if enabled
    if (this.compressionEnabled && options.compress !== false) {
      const dataSize = JSON.stringify(data).length;
      if (dataSize > 1024) { // Compress objects > 1KB
        try {
          processedData = await compressData(data);
          compressed = true;
        } catch (error) {
          console.warn('Compression failed, storing uncompressed:', error);
        }
      }
    }

    const item: CacheItem<any> = {
      data: processedData,
      timestamp: now,
      expiresAt: now + ttl,
      accessCount: 0,
      lastAccessed: now,
      priority: options.priority || 'medium',
      tags: options.tags || [],
      compressed
    };

    // Ensure cache size limits
    await this.evictIfNeeded();
    
    this.cache.set(key, item);
    this.updateStats();
  }

  async get<T>(key: string): Promise<T | null> {
    const item = this.cache.get(key);
    
    if (!item) {
      this.stats.misses++;
      this.stats.totalRequests++;
      this.updateStats();
      return null;
    }

    const now = Date.now();
    if (now > item.expiresAt) {
      this.cache.delete(key);
      this.stats.misses++;
      this.stats.totalRequests++;
      this.updateStats();
      return null;
    }

    // Update access statistics
    item.accessCount++;
    item.lastAccessed = now;
    this.stats.hits++;
    this.stats.totalRequests++;
    this.updateStats();

    // Decompress if needed
    if (item.compressed) {
      try {
        return await decompressData(item.data);
      } catch (error) {
        console.warn('Decompression failed:', error);
        this.cache.delete(key);
        return null;
      }
    }

    return item.data;
  }

  invalidateByTag(tag: string): void {
    for (const [key, item] of this.cache.entries()) {
      if (item.tags.includes(tag)) {
        this.cache.delete(key);
      }
    }
    this.updateStats();
  }

  getStats(): CacheStats {
    return { ...this.stats };
  }

  cleanup(): void {
    const cleaned = cleanupExpired(this.cache);
    this.updateStats();
  }

  clear(): void {
    this.cache.clear();
    this.stats = { 
      hits: 0, 
      misses: 0, 
      size: 0, 
      memoryUsage: 0, 
      hitRate: 0, 
      totalRequests: 0, 
      evictions: 0 
    };
  }

  private async evictIfNeeded(): Promise<void> {
    if (this.cache.size < this.maxSize) return;

    // Remove 20% of cache
    const toRemove = Math.floor(this.cache.size * 0.2);
    lruEviction(this.cache, toRemove);
    this.stats.evictions += toRemove;
  }

  private updateStats(): void {
    this.stats.size = this.cache.size;
    this.stats.hitRate = this.stats.hits / (this.stats.hits + this.stats.misses) || 0;
    this.stats.memoryUsage = estimateMemoryUsage(this.cache);
  }
}
