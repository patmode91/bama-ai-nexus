
import { searchCacheWarmup } from './searchCacheWarmup';
import { aiCacheWarmup } from './aiCacheWarmup';
import { businessCacheWarmup } from './businessCacheWarmup';
import { systemCacheWarmup } from './systemCacheWarmup';
import { logger } from '../loggerService';

class CacheInitializer {
  private static instance: CacheInitializer;
  private isInitialized: boolean = false;
  private initializationPromise: Promise<void> | null = null;

  static getInstance(): CacheInitializer {
    if (!CacheInitializer.instance) {
      CacheInitializer.instance = new CacheInitializer();
    }
    return CacheInitializer.instance;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = this.performInitialization();
    return this.initializationPromise;
  }

  private async performInitialization(): Promise<void> {
    try {
      logger.info('Starting cache initialization...', {}, 'CacheInitializer');

      // Initialize all cache warmup services in parallel
      const warmupPromises = [
        systemCacheWarmup.warmup(),
        searchCacheWarmup.warmup(),
        businessCacheWarmup.warmup(),
        aiCacheWarmup.warmup()
      ];

      await Promise.allSettled(warmupPromises);

      this.isInitialized = true;
      logger.info('Cache initialization completed', {}, 'CacheInitializer');
    } catch (error) {
      logger.error('Cache initialization failed', { error }, 'CacheInitializer');
      throw error;
    }
  }

  async warmupUserSpecificCache(userId: string): Promise<void> {
    try {
      await Promise.allSettled([
        systemCacheWarmup.warmupUserSession(userId),
        aiCacheWarmup.warmupUserSpecific(userId)
      ]);
      
      logger.info('User-specific cache warmed up', { userId }, 'CacheInitializer');
    } catch (error) {
      logger.warn('User-specific cache warmup failed', { userId, error }, 'CacheInitializer');
    }
  }

  getInitializationStatus(): boolean {
    return this.isInitialized;
  }
}

export const cacheInitializer = CacheInitializer.getInstance();

// Auto-initialize when the module loads
cacheInitializer.initialize().catch(error => {
  console.warn('Auto cache initialization failed:', error);
});
