
import { AdvancedCacheCore } from './advancedCacheCore';
import { CacheOptions } from './types';

class AdvancedCacheService extends AdvancedCacheCore {
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
      const item = this.getStats();
      const now = Date.now();
      
      // Check if data is stale (simplified check)
      if (item.size > 0) {
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

  private async refreshInBackground<T>(key: string, fn: () => Promise<T>, options: CacheOptions): Promise<void> {
    try {
      const result = await fn();
      await this.set(key, result, options);
    } catch (error) {
      console.warn(`Background refresh failed for key ${key}:`, error);
    }
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
