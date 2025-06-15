
import { useState, useCallback } from 'react';
import { searchCache } from '@/services/cache/advancedCacheService';
import { CacheOptions } from '@/services/cache/types';

export const useCachedSearch = () => {
  const [isLoading, setIsLoading] = useState(false);

  const searchWithCache = useCallback(async <T>(
    key: string,
    searchFn: () => Promise<T>,
    options: CacheOptions = {}
  ): Promise<T> => {
    setIsLoading(true);
    
    try {
      const defaultOptions: CacheOptions = {
        ttl: 300000, // 5 minutes
        priority: 'medium', // Changed from 'normal' to 'medium'
        tags: ['search'],
        ...options
      };

      const result = await searchCache.memoize(key, searchFn, defaultOptions);
      return result;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const invalidateSearchCache = useCallback((tag?: string) => {
    if (tag) {
      searchCache.invalidateByTag(tag);
    } else {
      searchCache.clear();
    }
  }, []);

  const getSearchStats = useCallback(() => {
    return searchCache.getStats();
  }, []);

  return {
    searchWithCache,
    invalidateSearchCache,
    getSearchStats,
    isLoading
  };
};
