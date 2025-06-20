
import { searchCache } from './advancedCacheService';

class SearchCacheWarmup {
  async warmup(): Promise<void> {
    console.log('Starting search cache warmup...');
    
    try {
      // Warmup popular search terms
      await this.warmupPopularSearches();
      
      console.log('Search cache warmup completed');
    } catch (error) {
      console.warn('Search cache warmup failed:', error);
    }
  }

  private async warmupPopularSearches(): Promise<void> {
    const popularSearches = [
      'restaurants',
      'technology',
      'healthcare',
      'automotive',
      'retail',
      'construction',
      'education',
      'finance'
    ];

    const mockResults = popularSearches.map(term => ({
      term,
      results: Array.from({ length: 10 }, (_, i) => ({
        id: i + 1,
        name: `${term} Business ${i + 1}`,
        category: term,
        rating: 4.0 + Math.random(),
        location: 'Alabama'
      })),
      total: 50 + Math.floor(Math.random() * 100)
    }));

    for (const result of mockResults) {
      searchCache.set(
        `search_${result.term}`,
        result,
        {
          ttl: 600000, // 10 minutes
          priority: 'normal',
          tags: ['search', 'popular']
        }
      );
    }
  }
}

export const searchCacheWarmup = new SearchCacheWarmup();
