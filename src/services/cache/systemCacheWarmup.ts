
import { advancedCacheService } from './advancedCacheService';

class SystemCacheWarmup {
  async warmup(): Promise<void> {
    console.log('Starting system cache warmup...');
    
    try {
      // Warmup system configuration and metadata
      await this.warmupSystemConfig();
      await this.warmupAppMetadata();
      
      console.log('System cache warmup completed');
    } catch (error) {
      console.warn('System cache warmup failed:', error);
    }
  }

  private async warmupSystemConfig(): Promise<void> {
    const systemConfig = {
      version: '2.0.0',
      features: ['ai-search', 'matchmaking', 'realtime', 'analytics'],
      maintenance: false,
      lastUpdated: new Date().toISOString()
    };

    advancedCacheService.set(
      'system_config',
      systemConfig,
      {
        ttl: 3600000, // 1 hour
        priority: 'high',
        tags: ['system', 'config']
      }
    );
  }

  private async warmupAppMetadata(): Promise<void> {
    const appMetadata = {
      name: 'BamaAI Connect',
      description: 'Alabama Business Intelligence Platform',
      totalBusinesses: 1200,
      totalUsers: 5600,
      categories: [
        'Technology', 'Healthcare', 'Automotive', 'Retail', 
        'Construction', 'Education', 'Finance', 'Restaurants'
      ],
      regions: ['Birmingham', 'Montgomery', 'Huntsville', 'Mobile', 'Tuscaloosa']
    };

    advancedCacheService.set(
      'app_metadata',
      appMetadata,
      {
        ttl: 7200000, // 2 hours
        priority: 'normal',
        tags: ['system', 'metadata']
      }
    );
  }

  async warmupUserSession(userId: string): Promise<void> {
    // Warmup user-specific cache data
    const userSession = {
      userId,
      preferences: {
        theme: 'dark',
        notifications: true,
        location: 'Alabama'
      },
      recentSearches: [],
      favoriteCategories: ['technology', 'healthcare'],
      lastActivity: new Date().toISOString()
    };

    advancedCacheService.set(
      `user_session_${userId}`,
      userSession,
      {
        ttl: 1800000, // 30 minutes
        priority: 'high',
        tags: ['user', 'session', userId]
      }
    );
  }
}

export const systemCacheWarmup = new SystemCacheWarmup();
