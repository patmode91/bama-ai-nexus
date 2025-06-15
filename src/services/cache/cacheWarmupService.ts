
import { businessCacheWarmup } from './businessCacheWarmup';
import { searchCacheWarmup } from './searchCacheWarmup';
import { aiCacheWarmup } from './aiCacheWarmup';
import { systemCacheWarmup } from './systemCacheWarmup';
import { advancedCacheService, businessCache, searchCache, aiCache } from './advancedCacheService';

class CacheWarmupService {
  async warmupOnAppStart(): Promise<void> {
    console.log('Starting cache warmup...');
    
    try {
      await Promise.all([
        businessCacheWarmup.warmup(),
        searchCacheWarmup.warmup(),
        aiCacheWarmup.warmup(),
        systemCacheWarmup.warmup()
      ]);
      
      console.log('Cache warmup completed successfully');
    } catch (error) {
      console.warn('Cache warmup failed:', error);
    }
  }

  async schedulePeriodicWarmup(): Promise<void> {
    setInterval(async () => {
      console.log('Performing scheduled cache warmup...');
      await this.warmupOnAppStart();
    }, 30 * 60 * 1000);
  }

  async warmupUserSpecificCache(userId: string): Promise<void> {
    await systemCacheWarmup.warmupUserSpecific(userId);
  }

  async invalidateStaleCache(): Promise<void> {
    advancedCacheService.cleanup();
    businessCache.cleanup();
    searchCache.cleanup();
    aiCache.cleanup();
    
    console.log('Stale cache invalidation completed');
  }
}

export const cacheWarmupService = new CacheWarmupService();

// Auto-start warmup when service is imported
if (typeof window !== 'undefined') {
  setTimeout(() => {
    cacheWarmupService.warmupOnAppStart();
    cacheWarmupService.schedulePeriodicWarmup();
  }, 2000);
}
