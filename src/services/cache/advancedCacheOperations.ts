
import { CacheCore } from './cacheCore';
import { CacheOptions, StaleWhileRevalidateOptions } from './types';

export class AdvancedCacheOperations extends CacheCore {
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
    const entry = this.getEntry(key);
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
      return entry.compressed ? await this.decompressData(entry.data as string) : entry.data;
    }

    if (age < options.freshTTL) {
      // Data is stale but not expired, return stale data and revalidate in background
      const staleData = entry.compressed ? await this.decompressData(entry.data as string) : entry.data;
      
      // Revalidate in background
      factory().then(newData => {
        this.set(key, newData, { ttl: options.freshTTL });
      }).catch(console.error);
      
      return staleData;
    }

    // Data is expired, fetch fresh
    const result = await factory();
    await this.set(key, result, { ttl: options.freshTTL });
    return result;
  }

  private getEntry(key: string): any {
    const cache = this.getCache();
    return cache.get(key);
  }

  private getCache(): Map<string, any> {
    // Access to internal cache - this is a simplified approach
    // In a real implementation, you might want to expose this more cleanly
    return (this as any).cache;
  }

  private async decompressData<T>(compressedData: string): Promise<T> {
    try {
      return JSON.parse(atob(compressedData));
    } catch (error) {
      console.error('Failed to decompress data:', error);
      throw error;
    }
  }
}
