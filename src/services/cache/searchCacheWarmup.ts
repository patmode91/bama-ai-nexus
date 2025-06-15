
import { searchCache } from './advancedCacheService';
import { supabase } from '@/integrations/supabase/client';
import { warmupConfig } from './warmupConfig';

export class SearchCacheWarmup {
  async warmup(): Promise<void> {
    try {
      await Promise.all([
        this.warmupPopularSearches(),
        this.warmupLocationSearches()
      ]);
      
      console.log('Search cache warmup completed');
    } catch (error) {
      console.warn('Search cache warmup failed:', error);
    }
  }

  private async warmupPopularSearches(): Promise<void> {
    await searchCache.warmup(
      warmupConfig.searches.popular.map(term => `search-${term}`),
      async (key) => {
        const searchTerm = key.replace('search-', '');
        const { data } = await supabase
          .from('businesses')
          .select('*')
          .or(`businessname.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,category.ilike.%${searchTerm}%`)
          .limit(50);
        return data || [];
      }
    );
  }

  private async warmupLocationSearches(): Promise<void> {
    const popularLocations = ['Birmingham', 'Huntsville', 'Mobile', 'Montgomery'];
    await searchCache.warmup(
      popularLocations.map(loc => `search-location-${loc}`),
      async (key) => {
        const location = key.replace('search-location-', '');
        const { data } = await supabase
          .from('businesses')
          .select('*')
          .ilike('location', `%${location}%`)
          .limit(50);
        return data || [];
      }
    );
  }
}

export const searchCacheWarmup = new SearchCacheWarmup();
