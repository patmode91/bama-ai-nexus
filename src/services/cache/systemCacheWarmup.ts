
import { advancedCacheService } from './advancedCacheService';
import { supabase } from '@/integrations/supabase/client';

export class SystemCacheWarmup {
  async warmup(): Promise<void> {
    try {
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

  async warmupUserSpecific(userId: string): Promise<void> {
    try {
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
}

export const systemCacheWarmup = new SystemCacheWarmup();
