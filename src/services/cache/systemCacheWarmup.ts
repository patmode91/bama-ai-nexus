
import { advancedCacheService } from './advancedCacheService';

class SystemCacheWarmup {
  async warmup(): Promise<void> {
    console.log('Starting system cache warmup...');
    
    try {
      // Warmup system configuration
      await this.warmupSystemConfig();
      
      // Warmup user preferences
      await this.warmupUserPreferences();
      
      console.log('System cache warmup completed');
    } catch (error) {
      console.warn('System cache warmup failed:', error);
    }
  }

  async warmupUserSpecific(userId: string): Promise<void> {
    console.log(`Warming up cache for user: ${userId}`);
    
    try {
      await advancedCacheService.set(`user:${userId}:preferences`, {
        theme: 'light',
        notifications: true,
        language: 'en'
      }, {
        ttl: 24 * 60 * 60 * 1000, // 24 hours
        priority: 'normal'
      });
    } catch (error) {
      console.warn('User-specific cache warmup failed:', error);
    }
  }

  private async warmupSystemConfig(): Promise<void> {
    const systemConfig = {
      version: '1.0.0',
      features: ['ai-search', 'business-matching', 'analytics'],
      maintenance: false
    };

    await advancedCacheService.set('system-config', systemConfig, {
      ttl: 60 * 60 * 1000, // 1 hour
      priority: 'high'
    });
  }

  private async warmupUserPreferences(): Promise<void> {
    const defaultPreferences = {
      theme: 'light',
      notifications: true,
      language: 'en',
      searchFilters: []
    };

    await advancedCacheService.set('default-user-preferences', defaultPreferences, {
      ttl: 24 * 60 * 60 * 1000, // 24 hours
      priority: 'normal'
    });
  }
}

export const systemCacheWarmup = new SystemCacheWarmup();
