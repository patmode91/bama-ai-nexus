
import { businessCache } from './advancedCacheService';
import { supabase } from '@/integrations/supabase/client';
import { warmupConfig } from './warmupConfig';

export class BusinessCacheWarmup {
  async warmup(): Promise<void> {
    try {
      await Promise.all([
        this.warmupPopularCategories(),
        this.warmupFeaturedBusinesses()
      ]);
      
      console.log('Business cache warmup completed');
    } catch (error) {
      console.warn('Business cache warmup failed:', error);
    }
  }

  private async warmupPopularCategories(): Promise<void> {
    await businessCache.warmup(
      warmupConfig.businesses.popular.map(cat => `businesses-category-${cat}`),
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
  }

  private async warmupFeaturedBusinesses(): Promise<void> {
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
  }
}

export const businessCacheWarmup = new BusinessCacheWarmup();
