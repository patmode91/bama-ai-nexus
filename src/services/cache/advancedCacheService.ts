
interface CacheOptions {
  ttl?: number;
  priority?: 'low' | 'normal' | 'high';
  tags?: string[];
  compress?: boolean;
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  priority: 'low' | 'normal' | 'high';
  tags: string[];
  accessCount: number;
  lastAccessed: number;
  compressed?: boolean;
}

interface StaleWhileRevalidateOptions {
  staleTTL: number;
  freshTTL: number;
}

export interface CacheStats {
  size: number;
  maxSize: number;
  hitRate: number;
  memoryUsage: number;
  expiredEntries: number;
  entriesByPriority: {
    high: number;
    normal: number;
    low: number;
  };
  hits: number;
  misses: number;
  totalRequests: number;
  evictions: number;
}

class AdvancedCacheService {
  private cache = new Map<string, CacheEntry<any>>();
  private maxSize = 100; // Maximum number of entries
  private compressionThreshold = 1024; // Compress data larger than 1KB
  private stats = {
    hits: 0,
    misses: 0,
    evictions: 0
  };

  async set<T>(key: string, data: T, options: CacheOptions = {}): Promise<void> {
    const {
      ttl = 300000, // 5 minutes default
      priority = 'normal',
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
    if (compress && this.shouldCompress(data)) {
      processedData = await this.compress(data);
      isCompressed = true;
    }

    const entry: CacheEntry<T> = {
      data: processedData,
      timestamp: Date.now(),
      ttl,
      priority,
      tags,
      accessCount: 0,
      lastAccessed: Date.now(),
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
    if (this.isExpired(entry)) {
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
      data = await this.decompress(data);
    }

    return data;
  }

  async memoize<T>(
    key: string,
    factory: () => Promise<T>,
    options: CacheOptions = {}
  ): Promise<T> {
    const cached = await this.get<T>(key);
    
    if (cached !== null) {
      return cached;
    }

    const result = await factory();
    await this.set(key, result, options);
    
    return result;
  }

  async staleWhileRevalidate<T>(
    key: string,
    factory: () => Promise<T>,
    options: StaleWhileRevalidateOptions
  ): Promise<T> {
    const entry = this.cache.get(key);
    const now = Date.now();

    if (!entry) {
      // No cached data, fetch fresh
      const result = await factory();
      await this.set(key, result, { ttl: options.freshTTL });
      return result;
    }

    const age = now - entry.timestamp;

    if (age < options.staleTTL) {
      // Data is fresh, return immediately
      entry.accessCount++;
      entry.lastAccessed = now;
      this.stats.hits++;
      return entry.compressed ? await this.decompress(entry.data) : entry.data;
    }

    if (age < options.freshTTL) {
      // Data is stale but not expired, return stale data and revalidate in background
      const staleData = entry.compressed ? await this.decompress(entry.data) : entry.data;
      
      // Revalidate in background
      factory().then(newData => {
        this.set(key, newData, { ttl: options.freshTTL });
      }).catch(console.error);
      
      this.stats.hits++;
      return staleData;
    }

    // Data is expired, fetch fresh
    const result = await factory();
    await this.set(key, result, { ttl: options.freshTTL });
    return result;
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

  // Make cleanup method public
  cleanup(): void {
    for (const [key, entry] of this.cache.entries()) {
      if (this.isExpired(entry)) {
        this.cache.delete(key);
      }
    }
  }

  getStats(): CacheStats {
    const entries = Array.from(this.cache.values());
    const totalRequests = this.stats.hits + this.stats.misses;
    
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRate: totalRequests > 0 ? this.stats.hits / totalRequests : 0,
      memoryUsage: this.estimateMemoryUsage(),
      expiredEntries: entries.filter(entry => this.isExpired(entry)).length,
      entriesByPriority: {
        high: entries.filter(e => e.priority === 'high').length,
        normal: entries.filter(e => e.priority === 'normal').length,
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
    const entries = Array.from(this.cache.entries());
    
    // Sort by priority (low first) then by last accessed time
    entries.sort(([, a], [, b]) => {
      const priorityWeight = { low: 0, normal: 1, high: 2 };
      const priorityDiff = priorityWeight[a.priority] - priorityWeight[b.priority];
      
      if (priorityDiff !== 0) {
        return priorityDiff;
      }
      
      return a.lastAccessed - b.lastAccessed;
    });

    // Remove the least important entry
    const [keyToEvict] = entries[0];
    this.cache.delete(keyToEvict);
    this.stats.evictions++;
  }

  private isExpired(entry: CacheEntry<any>): boolean {
    return Date.now() - entry.timestamp > entry.ttl;
  }

  private shouldCompress(data: any): boolean {
    const size = new Blob([JSON.stringify(data)]).size;
    return size > this.compressionThreshold;
  }

  private async compress(data: any): Promise<string> {
    // Simple base64 compression simulation
    // In a real implementation, you might use actual compression algorithms
    return btoa(JSON.stringify(data));
  }

  private async decompress(compressedData: string): Promise<any> {
    try {
      return JSON.parse(atob(compressedData));
    } catch (error) {
      console.error('Failed to decompress data:', error);
      return null;
    }
  }

  private calculateHitRate(): number {
    const entries = Array.from(this.cache.values());
    const totalAccesses = entries.reduce((sum, entry) => sum + entry.accessCount, 0);
    const totalEntries = entries.length;
    
    return totalEntries > 0 ? totalAccesses / totalEntries : 0;
  }

  private estimateMemoryUsage(): number {
    // Rough estimation of memory usage in bytes
    let totalSize = 0;
    
    for (const entry of this.cache.values()) {
      totalSize += new Blob([JSON.stringify(entry)]).size;
    }
    
    return totalSize;
  }
}

// Create and export cache instances
export const advancedCacheService = new AdvancedCacheService();
export const businessCache = new AdvancedCacheService();
export const searchCache = new AdvancedCacheService();
export const aiCache = new AdvancedCacheService();
