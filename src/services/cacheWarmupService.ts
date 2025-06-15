import { businessCache, searchCache, aiCache, advancedCacheService } from './cache/advancedCacheService';
import { supabase } from '@/integrations/supabase/client';

interface WarmupConfig {
  businesses: {
    popular: string[];
    featured: string[];
    recent: string[];
  };
  searches: {
    popular: string[];
    trending: string[];
  };
  ai: {
    commonQueries: string[];
    recommendations: string[];
  };
}

class CacheWarmupService {
  private warmupConfig: WarmupConfig = {
    businesses: {
      popular: ['tech', 'healthcare', 'manufacturing', 'aerospace'],
      featured: ['verified', 'top-rated', 'recently-updated'],
      recent: ['new-listings', 'updated-profiles']
    },
    searches: {
      popular: ['AI companies', 'Tech startups', 'Birmingham', 'Huntsville'],
      trending: ['machine learning', 'fintech', 'biotech', 'cyber security']
    },
    ai: {
      commonQueries: ['business analysis', 'market insights', 'recommendations'],
      recommendations: ['b2b-matching', 'investment-opportunities']
    }
  };

  async warmupOnAppStart(): Promise<void> {
    console.log('Starting cache warmup...');
    
    try {
      await Promise.all([
        this.warmupBusinessCache(),
        this.warmupSearchCache(),
        this.warmupAICache(),
        this.warmupSystemCache()
      ]);
      
      console.log('Cache warmup completed successfully');
    } catch (error) {
      console.warn('Cache warmup failed:', error);
    }
  }

  async warmupBusinessCache(): Promise<void> {
    try {
      // Warmup popular business categories
      await businessCache.warmup(
        this.warmupConfig.businesses.popular.map(cat => `businesses-category-${cat}`),
        async (key) => {
          const category = key.replace('businesses-category-', '');
          const { data } = await supabase
            .from('businesses')
            .select('*')
            .eq('category', category)
            .limit(50);
          return data || [];
        }
      );

      // Warmup featured businesses
      await businessCache.warmup(
        ['businesses-featured', 'businesses-verified'],
        async (key) => {
          if (key === 'businesses-featured') {
            const { data } = await supabase
              .from('businesses')
              .select('*')
              .eq('verified', true)
              .order('rating', { ascending: false })
              .limit(20);
            return data || [];
          } else {
            const { data } = await supabase
              .from('businesses')
              .select('*')
              .eq('verified', true)
              .limit(100);
            return data || [];
          }
        }
      );

      console.log('Business cache warmup completed');
    } catch (error) {
      console.warn('Business cache warmup failed:', error);
    }
  }

  async warmupSearchCache(): Promise<void> {
    try {
      // Warmup popular search terms
      await searchCache.warmup(
        this.warmupConfig.searches.popular.map(term => `search-${term}`),
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

      // Warmup location-based searches
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

      console.log('Search cache warmup completed');
    } catch (error) {
      console.warn('Search cache warmup failed:', error);
    }
  }

  async warmupAICache(): Promise<void> {
    try {
      // Warmup common AI responses
      await aiCache.warmup(
        this.warmupConfig.ai.commonQueries.map(query => `ai-response-${query}`),
        async (key) => {
          const query = key.replace('ai-response-', '');
          // Simulate AI response for common queries
          return {
            query,
            response: `Cached AI response for: ${query}`,
            confidence: 0.85,
            timestamp: Date.now()
          };
        }
      );

      // Warmup recommendation data
      await aiCache.warmup(
        ['ai-recommendations-business', 'ai-recommendations-trending'],
        async (key) => {
          if (key === 'ai-recommendations-business') {
            const { data } = await supabase
              .from('businesses')
              .select('*')
              .eq('verified', true)
              .order('rating', { ascending: false })
              .limit(10);
            return data || [];
          } else {
            // Mock trending recommendations
            return [
              { type: 'trending', category: 'AI/ML', growth: '+25%' },
              { type: 'trending', category: 'Fintech', growth: '+18%' },
              { type: 'trending', category: 'Healthcare Tech', growth: '+22%' }
            ];
          }
        }
      );

      console.log('AI cache warmup completed');
    } catch (error) {
      console.warn('AI cache warmup failed:', error);
    }
  }

  async warmupSystemCache(): Promise<void> {
    try {
      // Warmup system-wide data
      await advancedCacheService.warmup(
        ['system-stats', 'system-config', 'user-preferences'],
        async (key) => {
          switch (key) {
            case 'system-stats':
              const { count } = await supabase
                .from('businesses')
                .select('*', { count: 'exact', head: true });
              return {
                totalBusinesses: count || 0,
                lastUpdated: Date.now()
              };
            case 'system-config':
              return {
                cacheEnabled: true,
                compressionEnabled: true,
                analyticsEnabled: true
              };
            case 'user-preferences':
              return {
                theme: 'dark',
                notifications: true,
                autoRefresh: true
              };
            default:
              return {};
          }
        }
      );

      console.log('System cache warmup completed');
    } catch (error) {
      console.warn('System cache warmup failed:', error);
    }
  }

  async schedulePeriodicWarmup(): Promise<void> {
    // Warmup cache every 30 minutes
    setInterval(async () => {
      console.log('Performing scheduled cache warmup...');
      await this.warmupOnAppStart();
    }, 30 * 60 * 1000);
  }

  async warmupUserSpecificCache(userId: string): Promise<void> {
    try {
      // Warmup user-specific data
      await advancedCacheService.warmup(
        [`user-${userId}-preferences`, `user-${userId}-saved-businesses`],
        async (key) => {
          if (key.includes('preferences')) {
            const { data } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', userId)
              .single();
            return data;
          } else {
            const { data } = await supabase
              .from('saved_businesses')
              .select('*, businesses(*)')
              .eq('user_id', userId);
            return data || [];
          }
        }
      );

      console.log(`User-specific cache warmup completed for user: ${userId}`);
    } catch (error) {
      console.warn(`User-specific cache warmup failed for user ${userId}:`, error);
    }
  }

  async invalidateStaleCache(): Promise<void> {
    // Clean up old cache entries
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
  // Only run in browser environment
  setTimeout(() => {
    cacheWarmupService.warmupOnAppStart();
    cacheWarmupService.schedulePeriodicWarmup();
  }, 2000); // Delay to ensure app is initialized
}
