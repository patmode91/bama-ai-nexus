
import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { searchCache } from '@/services/advancedCacheService';
import { useBusinesses } from './useBusinesses';

interface SearchParams {
  query: string;
  category?: string;
  location?: string;
  filters?: Record<string, any>;
}

export const useCachedSearch = () => {
  const [searchParams, setSearchParams] = useState<SearchParams>({ query: '' });
  const { data: businesses } = useBusinesses();

  const generateCacheKey = useCallback((params: SearchParams) => {
    const key = `search-${params.query}-${params.category || 'all'}-${params.location || 'all'}`;
    if (params.filters) {
      const filterString = Object.entries(params.filters)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, value]) => `${key}:${value}`)
        .join(',');
      return `${key}-${filterString}`;
    }
    return key;
  }, []);

  const performSearch = useCallback(async (params: SearchParams) => {
    if (!businesses) return [];

    // Simulate search logic
    return businesses.filter(business => {
      const matchesQuery = !params.query || 
        business.businessname?.toLowerCase().includes(params.query.toLowerCase()) ||
        business.description?.toLowerCase().includes(params.query.toLowerCase());
      
      const matchesCategory = !params.category || 
        business.category?.toLowerCase() === params.category.toLowerCase();
      
      const matchesLocation = !params.location || 
        business.location?.toLowerCase().includes(params.location.toLowerCase());

      return matchesQuery && matchesCategory && matchesLocation;
    });
  }, [businesses]);

  const {
    data: searchResults,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['cached-search', searchParams],
    queryFn: async () => {
      const cacheKey = generateCacheKey(searchParams);
      
      return await searchCache.memoize(
        cacheKey,
        () => performSearch(searchParams),
        {
          ttl: 5 * 60 * 1000, // 5 minutes for search results
          tags: ['search', 'businesses']
        }
      );
    },
    enabled: !!searchParams.query && !!businesses,
    staleTime: 2 * 60 * 1000, // 2 minutes stale time
    refetchOnWindowFocus: false
  });

  const search = useCallback((params: SearchParams) => {
    setSearchParams(params);
  }, []);

  const clearSearchCache = useCallback(() => {
    searchCache.invalidateByTag('search');
  }, []);

  const getPopularSearches = useCallback(async () => {
    const cacheKey = 'popular-searches';
    
    return await searchCache.memoize(
      cacheKey,
      async () => {
        // Simulate popular searches
        return [
          'AI companies',
          'Tech startups',
          'Healthcare',
          'Manufacturing',
          'Birmingham businesses',
          'Huntsville tech'
        ];
      },
      {
        ttl: 60 * 60 * 1000, // 1 hour
        tags: ['search', 'popular']
      }
    );
  }, []);

  const warmupSearchCache = useCallback(async (queries: string[]) => {
    const warmupPromises = queries.map(query => {
      const params = { query };
      const cacheKey = generateCacheKey(params);
      
      return searchCache.set(cacheKey, performSearch(params), {
        ttl: 10 * 60 * 1000, // 10 minutes
        priority: 'medium',
        tags: ['search', 'warmup']
      });
    });

    await Promise.all(warmupPromises);
  }, [generateCacheKey, performSearch]);

  return {
    searchResults,
    isLoading,
    error,
    search,
    clearSearchCache,
    getPopularSearches,
    warmupSearchCache,
    refetch
  };
};
