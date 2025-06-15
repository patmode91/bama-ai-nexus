interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
  accessCount: number;
  lastAccessed: number;
  priority: 'low' | 'medium' | 'high';
  tags: string[];
  compressed?: boolean;
}

interface CacheOptions {
  ttl?: number;
  priority?: 'low' | 'medium' | 'high';
  tags?: string[];
  compress?: boolean;
}

interface CacheStats {
  hits: number;
  misses: number;
  size: number;
  memoryUsage: number;
  hitRate: number;
  totalRequests: number;
  evictions: number;
}

class AdvancedCacheService {
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
          processedData = await this.compressData(data);
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
        return await this.decompressData(item.data);
      } catch (error) {
        console.warn('Decompression failed:', error);
        this.cache.delete(key);
        return null;
      }
    }

    return item.data;
  }

  async memoize<T>(key: string, fn: () => Promise<T>, options: CacheOptions = {}): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const result = await fn();
    await this.set(key, result, options);
    return result;
  }

  async staleWhileRevalidate<T>(
    key: string, 
    fn: () => Promise<T>, 
    options: { staleTTL?: number; freshTTL?: number } = {}
  ): Promise<T> {
    const cached = await this.get<T>(key);
    const staleTTL = options.staleTTL || 5 * 60 * 1000; // 5 minutes
    const freshTTL = options.freshTTL || 15 * 60 * 1000; // 15 minutes

    if (cached !== null) {
      const item = this.cache.get(key);
      const now = Date.now();
      const isStale = item && (now - item.timestamp) > staleTTL;

      if (isStale) {
        // Return stale data immediately, refresh in background
        this.refreshInBackground(key, fn, { ttl: freshTTL });
      }

      return cached;
    }

    // No cached data, fetch fresh
    const result = await fn();
    await this.set(key, result, { ttl: freshTTL });
    return result;
  }

  invalidateByTag(tag: string): void {
    for (const [key, item] of this.cache.entries()) {
      if (item.tags.includes(tag)) {
        this.cache.delete(key);
      }
    }
    this.updateStats();
  }

  async warmup(keys: string[], dataFetcher: (key: string) => Promise<any>): Promise<void> {
    const promises = keys.map(async (key) => {
      try {
        const data = await dataFetcher(key);
        await this.set(key, data, { priority: 'high', ttl: 30 * 60 * 1000 });
      } catch (error) {
        console.warn(`Failed to warmup cache for key ${key}:`, error);
      }
    });

    await Promise.allSettled(promises);
  }

  getStats(): CacheStats {
    return { ...this.stats };
  }

  cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiresAt) {
        this.cache.delete(key);
      }
    }
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

  private async refreshInBackground<T>(key: string, fn: () => Promise<T>, options: CacheOptions): Promise<void> {
    try {
      const result = await fn();
      await this.set(key, result, options);
    } catch (error) {
      console.warn(`Background refresh failed for key ${key}:`, error);
    }
  }

  private async evictIfNeeded(): Promise<void> {
    if (this.cache.size < this.maxSize) return;

    // LRU eviction with priority consideration
    const entries = Array.from(this.cache.entries());
    entries.sort((a, b) => {
      const priorityWeight = { low: 1, medium: 2, high: 3 };
      const aPriority = priorityWeight[a[1].priority];
      const bPriority = priorityWeight[b[1].priority];
      
      if (aPriority !== bPriority) {
        return aPriority - bPriority; // Lower priority first
      }
      
      return a[1].lastAccessed - b[1].lastAccessed; // Then by LRU
    });

    // Remove 20% of cache
    const toRemove = Math.floor(this.cache.size * 0.2);
    for (let i = 0; i < toRemove; i++) {
      if (entries[i]) {
        this.cache.delete(entries[i][0]);
        this.stats.evictions++;
      }
    }
  }

  private async compressData<T>(data: T): Promise<string> {
    // Simple compression simulation (in real app, use actual compression)
    return JSON.stringify(data);
  }

  private async decompressData<T>(compressedData: string): Promise<T> {
    // Simple decompression simulation
    return JSON.parse(compressedData);
  }

  private updateStats(): void {
    this.stats.size = this.cache.size;
    this.stats.hitRate = this.stats.hits / (this.stats.hits + this.stats.misses) || 0;
    
    // Estimate memory usage
    let memoryUsage = 0;
    for (const item of this.cache.values()) {
      memoryUsage += JSON.stringify(item).length;
    }
    this.stats.memoryUsage = memoryUsage / 1024 / 1024; // Convert to MB
  }
}

// Create specialized cache instances
export const advancedCacheService = new AdvancedCacheService();
export const businessCache = new AdvancedCacheService();
export const searchCache = new AdvancedCacheService();
export const aiCache = new AdvancedCacheService();

// Auto cleanup every 5 minutes
setInterval(() => {
  advancedCacheService.cleanup();
  businessCache.cleanup();
  searchCache.cleanup();
  aiCache.cleanup();
}, 5 * 60 * 1000);
