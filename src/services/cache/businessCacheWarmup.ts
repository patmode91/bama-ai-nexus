
import { businessCache } from './advancedCacheService';

class BusinessCacheWarmup {
  async warmup(): Promise<void> {
    console.log('Starting business cache warmup...');
    
    try {
      // Warmup popular business categories
      await this.warmupCategories();
      
      // Warmup featured businesses
      await this.warmupFeaturedBusinesses();
      
      console.log('Business cache warmup completed');
    } catch (error) {
      console.warn('Business cache warmup failed:', error);
    }
  }

  private async warmupCategories(): Promise<void> {
    const popularCategories = [
      'technology', 'healthcare', 'retail', 'manufacturing', 
      'finance', 'education', 'construction', 'food-service'
    ];

    businessCache.set('popular-categories', popularCategories, {
      ttl: 24 * 60 * 60 * 1000, // 24 hours
      priority: 'high'
    });
  }

  private async warmupFeaturedBusinesses(): Promise<void> {
    // Mock featured businesses data
    const featuredBusinesses = [
      { id: 1, name: 'Tech Innovators', category: 'technology' },
      { id: 2, name: 'Healthcare Plus', category: 'healthcare' },
      { id: 3, name: 'Retail Excellence', category: 'retail' }
    ];

    businessCache.set('featured-businesses', featuredBusinesses, {
      ttl: 12 * 60 * 60 * 1000, // 12 hours
      priority: 'high'
    });
  }
}

export const businessCacheWarmup = new BusinessCacheWarmup();
