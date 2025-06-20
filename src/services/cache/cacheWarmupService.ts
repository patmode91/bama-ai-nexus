
import { supabase } from '@/integrations/supabase/client';
import { aiCache } from './advancedCacheService';

interface WarmupConfig {
  businesses: boolean;
  searchSuggestions: boolean;
  analytics: boolean;
  categories: boolean;
}

class CacheWarmupService {
  private isWarming = false;

  async warmupCache(config: WarmupConfig = {
    businesses: true,
    searchSuggestions: true,
    analytics: false,
    categories: true
  }): Promise<void> {
    if (this.isWarming) {
      console.log('Cache warmup already in progress');
      return;
    }

    this.isWarming = true;
    console.log('Starting cache warmup...');

    try {
      const promises: Promise<void>[] = [];

      if (config.businesses) {
        promises.push(this.warmupBusinesses());
      }

      if (config.searchSuggestions) {
        promises.push(this.warmupSearchSuggestions());
      }

      if (config.analytics) {
        promises.push(this.warmupAnalytics());
      }

      if (config.categories) {
        promises.push(this.warmupCategories());
      }

      await Promise.all(promises);
      console.log('Cache warmup completed successfully');
    } catch (error) {
      console.error('Cache warmup failed:', error);
    } finally {
      this.isWarming = false;
    }
  }

  private async warmupBusinesses(): Promise<void> {
    try {
      // Warmup top businesses
      const { data: topBusinesses } = await supabase
        .from('businesses')
        .select('*')
        .eq('verified', true)
        .order('rating', { ascending: false })
        .limit(50);

      if (topBusinesses) {
        aiCache.set('top_businesses', topBusinesses, {
          ttl: 30 * 60 * 1000, // 30 minutes
          tags: ['businesses', 'top_rated']
        });
      }

      // Warmup businesses by category
      const categories = ['AI Solutions', 'Healthcare Technology', 'Software Development', 'IT Services'];
      
      for (const category of categories) {
        const { data: categoryBusinesses } = await supabase
          .from('businesses')
          .select('*')
          .ilike('category', `%${category}%`)
          .eq('verified', true)
          .limit(20);

        if (categoryBusinesses) {
          aiCache.set(`businesses_category_${category.toLowerCase().replace(/\s+/g, '_')}`, categoryBusinesses, {
            ttl: 60 * 60 * 1000, // 1 hour
            tags: ['businesses', 'category']
          });
        }
      }

      console.log('Business cache warmed up');
    } catch (error) {
      console.error('Failed to warmup businesses cache:', error);
    }
  }

  private async warmupSearchSuggestions(): Promise<void> {
    try {
      const { data: suggestions } = await supabase
        .from('search_suggestions')
        .select('*')
        .order('popularity_score', { ascending: false })
        .limit(100);

      if (suggestions) {
        aiCache.set('search_suggestions', suggestions, {
          ttl: 2 * 60 * 60 * 1000, // 2 hours
          tags: ['search', 'suggestions']
        });
      }

      console.log('Search suggestions cache warmed up');
    } catch (error) {
      console.error('Failed to warmup search suggestions cache:', error);
    }
  }

  private async warmupAnalytics(): Promise<void> {
    try {
      // Warmup business stats
      const { data: businessStats } = await supabase
        .from('businesses')
        .select('category, verified, rating')
        .not('category', 'is', null);

      if (businessStats) {
        const stats = this.calculateBusinessStats(businessStats);
        aiCache.set('business_stats', stats, {
          ttl: 15 * 60 * 1000, // 15 minutes
          tags: ['analytics', 'stats']
        });
      }

      console.log('Analytics cache warmed up');
    } catch (error) {
      console.error('Failed to warmup analytics cache:', error);
    }
  }

  private async warmupCategories(): Promise<void> {
    try {
      const { data: businesses } = await supabase
        .from('businesses')
        .select('category')
        .not('category', 'is', null);

      if (businesses) {
        const categories = [...new Set(businesses.map(b => b.category))].filter(Boolean);
        aiCache.set('business_categories', categories, {
          ttl: 4 * 60 * 60 * 1000, // 4 hours
          tags: ['categories', 'business']
        });
      }

      console.log('Categories cache warmed up');
    } catch (error) {
      console.error('Failed to warmup categories cache:', error);
    }
  }

  private calculateBusinessStats(businesses: any[]): any {
    const totalBusinesses = businesses.length;
    const verifiedBusinesses = businesses.filter(b => b.verified).length;
    const avgRating = businesses.reduce((sum, b) => sum + (b.rating || 0), 0) / totalBusinesses;
    
    const categoryCounts = businesses.reduce((acc, b) => {
      if (b.category) {
        acc[b.category] = (acc[b.category] || 0) + 1;
      }
      return acc;
    }, {});

    return {
      totalBusinesses,
      verifiedBusinesses,
      verificationRate: (verifiedBusinesses / totalBusinesses) * 100,
      avgRating: Math.round(avgRating * 10) / 10,
      categoryCounts,
      lastUpdated: new Date().toISOString()
    };
  }

  getCacheStats() {
    return aiCache.getStats();
  }

  clearCache(tags?: string[]) {
    if (tags) {
      tags.forEach(tag => aiCache.invalidateByTag(tag));
    } else {
      aiCache.clear();
    }
  }
}

export const cacheWarmupService = new CacheWarmupService();
