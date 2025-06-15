
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { advancedCacheService } from '@/services/cache/advancedCacheService';

export const useCachedBusinesses = () => {
  return useQuery({
    queryKey: ['businesses'],
    queryFn: async () => {
      const cacheKey = 'businesses-all';
      const cached = advancedCacheService.get(cacheKey);
      
      if (cached) {
        return cached;
      }

      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      advancedCacheService.set(cacheKey, data, {
        ttl: 300000, // 5 minutes
        tags: ['businesses'],
        priority: 'high'
      });

      return data;
    },
    staleTime: 60000, // 1 minute
    refetchOnWindowFocus: false,
  });
};
