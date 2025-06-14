
interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
  accessCount: number;
  lastAccessed: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  tags: string[];
}

interface CacheStats {
  hits: number;
  misses: number;
  size: number;
  hitRate: number;
  totalRequests: number;
  evictions: number;
}

interface CacheConfig {
  maxSize: number;
  defaultTTL: number;
  enableCompression: boolean;
  enableAnalytics: boolean;
  evictionPolicy: 'LRU' | 'LFU' | 'TTL' | 'PRIORITY';
}

class AdvancedCacheService {
  private cache = new Map<string, CacheItem<any>>();
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    size: 0,
    hitRate: 0,
    totalRequests: 0,
    evictions: 0
  };
  
  private config: CacheConfig = {
    maxSize: 1000,
    defaultTTL: 5 * 60 * 1000, // 5 minutes
    enableCompression: true,
    enableAnalytics: true,
    evictionPolicy: 'LRU'
  };

  private compressionWorker?: Worker;
  private warmupQueue: Set<string> = new Set();

  constructor(config?: Partial<CacheConfig>) {
    if (config) {
      this.config = { ...this.config, ...config };
    }
    this.initializeCompression();
    this.startCleanupInterval();
  }

  private initializeCompression() {
    if (this.config.enableCompression && typeof Worker !== 'undefined') {
      try {
        // Simple compression simulation - in production would use actual compression
        this.compressionWorker = new Worker(
          URL.createObjectURL(new Blob([`
            self.onmessage = function(e) {
              const { data, compress } = e.data;
              if (compress) {
                // Simulate compression
                const compressed = JSON.stringify(data);
                self.postMessage({ compressed, size: compressed.length });
              } else {
                // Simulate decompression
                const decompressed = JSON.parse(data);
                self.postMessage({ decompressed });
              }
            }
          `], { type: 'application/javascript' }))
        );
      } catch (error) {
        console.warn('Compression worker not available:', error);
      }
    }
  }

  async set<T>(
    key: string, 
    data: T, 
    options: {
      ttl?: number;
      priority?: 'low' | 'medium' | 'high' | 'critical';
      tags?: string[];
      compress?: boolean;
    } = {}
  ): Promise<void> {
    const now = Date.now();
    const ttl = options.ttl || this.config.defaultTTL;
    const priority = options.priority || 'medium';
    const tags = options.tags || [];

    // Check if we need to evict items
    if (this.cache.size >= this.config.maxSize) {
      await this.evictItems(1);
    }

    let processedData = data;
    if (options.compress && this.compressionWorker) {
      processedData = await this.compressData(data);
    }

    const cacheItem: CacheItem<T> = {
      data: processedData,
      timestamp: now,
      expiresAt: now + ttl,
      accessCount: 0,
      lastAccessed: now,
      priority,
      tags
    };

    this.cache.set(key, cacheItem);
    this.updateStats('set');
  }

  async get<T>(key: string): Promise<T | null> {
    this.stats.totalRequests++;
    const item = this.cache.get(key);

    if (!item) {
      this.stats.misses++;
      this.updateHitRate();
      return null;
    }

    const now = Date.now();
    if (now > item.expiresAt) {
      this.cache.delete(key);
      this.stats.misses++;
      this.updateHitRate();
      return null;
    }

    // Update access tracking
    item.accessCount++;
    item.lastAccessed = now;
    this.stats.hits++;
    this.updateHitRate();

    // Check if data needs decompression
    if (this.compressionWorker && this.isCompressed(item.data)) {
      return await this.decompressData(item.data);
    }

    return item.data;
  }

  async getMultiple<T>(keys: string[]): Promise<Map<string, T>> {
    const results = new Map<string, T>();
    const promises = keys.map(async key => {
      const value = await this.get<T>(key);
      if (value !== null) {
        results.set(key, value);
      }
    });

    await Promise.all(promises);
    return results;
  }

  async setMultiple<T>(items: Array<{ key: string; data: T; options?: any }>): Promise<void> {
    const promises = items.map(item => 
      this.set(item.key, item.data, item.options)
    );
    await Promise.all(promises);
  }

  invalidateByTag(tag: string): number {
    let invalidated = 0;
    for (const [key, item] of this.cache.entries()) {
      if (item.tags.includes(tag)) {
        this.cache.delete(key);
        invalidated++;
      }
    }
    return invalidated;
  }

  invalidateByPattern(pattern: RegExp): number {
    let invalidated = 0;
    for (const key of this.cache.keys()) {
      if (pattern.test(key)) {
        this.cache.delete(key);
        invalidated++;
      }
    }
    return invalidated;
  }

  async warmup(keys: string[], dataFetcher: (key: string) => Promise<any>): Promise<void> {
    const warmupPromises = keys.map(async key => {
      if (!this.cache.has(key) && !this.warmupQueue.has(key)) {
        this.warmupQueue.add(key);
        try {
          const data = await dataFetcher(key);
          await this.set(key, data, { priority: 'high', tags: ['warmup'] });
        } catch (error) {
          console.warn(`Cache warmup failed for key ${key}:`, error);
        } finally {
          this.warmupQueue.delete(key);
        }
      }
    });

    await Promise.all(warmupPromises);
  }

  private async evictItems(count: number): Promise<void> {
    const itemsToEvict = this.selectItemsForEviction(count);
    for (const key of itemsToEvict) {
      this.cache.delete(key);
      this.stats.evictions++;
    }
  }

  private selectItemsForEviction(count: number): string[] {
    const items = Array.from(this.cache.entries());
    
    switch (this.config.evictionPolicy) {
      case 'LRU':
        items.sort(([, a], [, b]) => a.lastAccessed - b.lastAccessed);
        break;
      case 'LFU':
        items.sort(([, a], [, b]) => a.accessCount - b.accessCount);
        break;
      case 'TTL':
        items.sort(([, a], [, b]) => a.expiresAt - b.expiresAt);
        break;
      case 'PRIORITY':
        const priorityOrder = { low: 0, medium: 1, high: 2, critical: 3 };
        items.sort(([, a], [, b]) => priorityOrder[a.priority] - priorityOrder[b.priority]);
        break;
    }

    return items.slice(0, count).map(([key]) => key);
  }

  private async compressData(data: any): Promise<any> {
    return new Promise((resolve) => {
      if (this.compressionWorker) {
        this.compressionWorker.onmessage = (e) => {
          resolve({ __compressed: e.data.compressed, __size: e.data.size });
        };
        this.compressionWorker.postMessage({ data, compress: true });
      } else {
        resolve(data);
      }
    });
  }

  private async decompressData(data: any): Promise<any> {
    if (!this.isCompressed(data)) return data;
    
    return new Promise((resolve) => {
      if (this.compressionWorker) {
        this.compressionWorker.onmessage = (e) => {
          resolve(e.data.decompressed);
        };
        this.compressionWorker.postMessage({ data: data.__compressed, compress: false });
      } else {
        resolve(data);
      }
    });
  }

  private isCompressed(data: any): boolean {
    return data && typeof data === 'object' && data.__compressed;
  }

  private updateStats(operation: 'set' | 'get' | 'delete') {
    this.stats.size = this.cache.size;
    if (operation === 'get') {
      this.updateHitRate();
    }
  }

  private updateHitRate() {
    this.stats.hitRate = this.stats.totalRequests > 0 
      ? (this.stats.hits / this.stats.totalRequests) * 100 
      : 0;
  }

  private startCleanupInterval() {
    setInterval(() => {
      this.cleanup();
    }, 60000); // Cleanup every minute
  }

  cleanup(): void {
    const now = Date.now();
    let cleaned = 0;
    
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiresAt) {
        this.cache.delete(key);
        cleaned++;
      }
    }
    
    if (cleaned > 0) {
      this.updateStats('delete');
      console.log(`Cache cleanup: removed ${cleaned} expired items`);
    }
  }

  getStats(): CacheStats {
    return { ...this.stats };
  }

  clear(): void {
    this.cache.clear();
    this.stats = {
      hits: 0,
      misses: 0,
      size: 0,
      hitRate: 0,
      totalRequests: 0,
      evictions: 0
    };
  }

  // Cache strategy patterns
  async memoize<T>(
    key: string,
    fetcher: () => Promise<T>,
    options?: { ttl?: number; tags?: string[] }
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const data = await fetcher();
    await this.set(key, data, options);
    return data;
  }

  async staleWhileRevalidate<T>(
    key: string,
    fetcher: () => Promise<T>,
    options?: { staleTTL?: number; freshTTL?: number }
  ): Promise<T> {
    const cached = this.cache.get(key);
    const now = Date.now();
    
    if (cached) {
      const isStale = now > (cached.timestamp + (options?.staleTTL || 30000));
      
      if (!isStale) {
        return cached.data;
      }
      
      // Return stale data immediately, refresh in background
      this.backgroundRefresh(key, fetcher, options?.freshTTL);
      return cached.data;
    }

    // No cached data, fetch immediately
    const data = await fetcher();
    await this.set(key, data, { ttl: options?.freshTTL });
    return data;
  }

  private async backgroundRefresh<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl?: number
  ): Promise<void> {
    try {
      const data = await fetcher();
      await this.set(key, data, { ttl, priority: 'high' });
    } catch (error) {
      console.warn(`Background refresh failed for key ${key}:`, error);
    }
  }
}

export const advancedCacheService = new AdvancedCacheService({
  maxSize: 2000,
  defaultTTL: 10 * 60 * 1000, // 10 minutes
  enableCompression: true,
  enableAnalytics: true,
  evictionPolicy: 'LRU'
});

// Export specialized cache instances
export const businessCache = new AdvancedCacheService({
  maxSize: 500,
  defaultTTL: 15 * 60 * 1000, // 15 minutes
  evictionPolicy: 'LFU'
});

export const searchCache = new AdvancedCacheService({
  maxSize: 1000,
  defaultTTL: 5 * 60 * 1000, // 5 minutes
  evictionPolicy: 'LRU'
});

export const aiCache = new AdvancedCacheService({
  maxSize: 200,
  defaultTTL: 30 * 60 * 1000, // 30 minutes
  evictionPolicy: 'PRIORITY'
});
