
import { searchCache } from './advancedCacheService';

class SearchCacheWarmup {
  async warmup(): Promise<void> {
    console.log('Starting search cache warmup...');
    
    try {
      // Warmup popular search queries
      await this.warmupPopularQueries();
      
      // Warmup search suggestions
      await this.warmupSearchSuggestions();
      
      console.log('Search cache warmup completed');
    } catch (error) {
      console.warn('Search cache warmup failed:', error);
    }
  }

  private async warmupPopularQueries(): Promise<void> {
    const popularQueries = [
      'technology companies',
      'healthcare providers',
      'restaurants',
      'manufacturing',
      'construction companies'
    ];

    for (const query of popularQueries) {
      await searchCache.set(`search:${query}`, [], {
        ttl: 30 * 60 * 1000, // 30 minutes
        priority: 'normal'
      });
    }
  }

  private async warmupSearchSuggestions(): Promise<void> {
    const suggestions = [
      'technology', 'healthcare', 'retail', 'manufacturing',
      'finance', 'education', 'construction', 'food-service'
    ];

    await searchCache.set('search-suggestions', suggestions, {
      ttl: 60 * 60 * 1000, // 1 hour
      priority: 'high'
    });
  }
}

export const searchCacheWarmup = new SearchCacheWarmup();
