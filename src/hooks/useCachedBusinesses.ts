
import { useQuery } from '@tanstack/react-query';
import { useBusinesses } from './useBusinesses';
import { businessCache, advancedCacheService } from '@/services/advancedCacheService';

export const useCachedBusinesses = (options?: {
  useStaleWhileRevalidate?: boolean;
  cacheKey?: string;
  tags?: string[];
}) => {
  const cacheKey = options?.cacheKey || 'businesses-list';
  const tags = options?.tags || ['businesses'];
  
  const { data: businessesData, isLoading, error, refetch } = useBusinesses();

  const {
    data: cachedData,
    isLoading: isCacheLoading,
    error: cacheError
  } = useQuery({
    queryKey: [cacheKey, 'cached'],
    queryFn: async () => {
      if (options?.useStaleWhileRevalidate) {
        return await businessCache.staleWhileRevalidate(
          cacheKey,
          async () => {
            const result = await refetch();
            return result.data;
          },
          {
            staleTTL: 5 * 60 * 1000, // 5 minutes stale
            freshTTL: 15 * 60 * 1000 // 15 minutes fresh
          }
        );
      } else {
        return await businessCache.memoize(
          cacheKey,
          async () => {
            const result = await refetch();
            return result.data;
          },
          {
            ttl: 15 * 60 * 1000, // 15 minutes
            tags
          }
        );
      }
    },
    enabled: !!businessesData,
    staleTime: options?.useStaleWhileRevalidate ? 5 * 60 * 1000 : 10 * 60 * 1000,
    refetchOnWindowFocus: false
  });

  const invalidateCache = async () => {
    businessCache.invalidateByTag('businesses');
    await refetch();
  };

  const preloadBusiness = async (businessId: string) => {
    const business = businessesData?.find(b => b.id === businessId);
    if (business) {
      await businessCache.set(`business-${businessId}`, business, {
        ttl: 30 * 60 * 1000, // 30 minutes
        priority: 'high',
        tags: ['business', 'preload']
      });
    }
  };

  return {
    data: cachedData || businessesData,
    isLoading: isCacheLoading || isLoading,
    error: cacheError || error,
    invalidateCache,
    preloadBusiness,
    refetch
  };
};

export const useCachedBusiness = (businessId: string) => {
  const cacheKey = `business-${businessId}`;
  
  return useQuery({
    queryKey: [cacheKey],
    queryFn: async () => {
      return await businessCache.memoize(
        cacheKey,
        async () => {
          // In a real app, this would fetch from an API
          // For now, we'll simulate it
          return { id: businessId, cached: true };
        },
        {
          ttl: 30 * 60 * 1000, // 30 minutes
          tags: ['business', `business-${businessId}`]
        }
      );
    },
    enabled: !!businessId,
    staleTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false
  });
};
