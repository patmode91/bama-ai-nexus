
import { advancedCacheService } from './advancedCacheService';

class SystemCacheWarmup {
  async warmup(): Promise<void> {
    console.log('Starting system cache warmup...');
    
    try {
      // Warmup system configuration
      await this.warmupSystemConfig();
      
      // Warmup common data
      await this.warmupCommonData();
      
      console.log('System cache warmup completed');
    } catch (error) {
      console.warn('System cache warmup failed:', error);
    }
  }

  private async warmupSystemConfig(): Promise<void> {
    const systemConfig = {
      version: '1.0.0',
      features: ['search', 'ai', 'realtime'],
      settings: {
        cacheEnabled: true,
        compressionEnabled: true,
        realtimeEnabled: true
      }
    };

    await advancedCacheService.set(
      'system_config',
      systemConfig,
      {
        ttl: 3600000, // 1 hour
        priority: 'medium', // Changed from 'normal' to 'medium'
        tags: ['system', 'config']
      }
    );
  }

  private async warmupCommonData(): Promise<void> {
    const commonData = {
      categories: ['Technology', 'Healthcare', 'Retail', 'Construction'],
      locations: ['Birmingham', 'Montgomery', 'Mobile', 'Huntsville'],
      tags: ['local', 'verified', 'popular', 'recommended']
    };

    for (const [key, value] of Object.entries(commonData)) {
      await advancedCacheService.set(
        `common_${key}`,
        value,
        {
          ttl: 1800000, // 30 minutes
          priority: 'medium', // Changed from 'normal' to 'medium'
          tags: ['common', key]
        }
      );
    }
  }

  async warmupUserSpecific(userId: string): Promise<void> {
    const userPreferences = {
      userId,
      favoriteCategories: [],
      searchHistory: [],
      savedBusinesses: []
    };

    await advancedCacheService.set(
      `user_preferences_${userId}`,
      userPreferences,
      {
        ttl: 3600000, // 1 hour
        priority: 'high', // Changed from 'normal' to 'high'
        tags: ['user', userId]
      }
    );
  }
}

export const systemCacheWarmup = new SystemCacheWarmup();
