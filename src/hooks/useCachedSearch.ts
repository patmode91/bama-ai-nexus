
import { useState, useCallback } from 'react';
import { searchCache } from '@/services/cache/advancedCacheService';

interface CacheOptions {
  ttl?: number;
  priority?: 'low' | 'normal' | 'high';
  tags?: string[];
}

export const useCachedSearch = () => {
  const [isLoading, setIsLoading] = useState(false);

  const searchWithCache = useCallback(async <T>(
    key: string,
    searchFn: () => Promise<T>,
    options: CacheOptions = {}
  ): Promise<T> => {
    setIsLoading(true);
    
    try {
      // Check cache first
      const cached = searchCache.get<T>(key);
      if (cached) {
        return cached;
      }

      // Execute search function
      const result = await searchFn();
      
      // Cache the result
      const defaultOptions: CacheOptions = {
        ttl: 300000, // 5 minutes
        priority: 'normal',
        tags: ['search'],
        ...options
      };

      searchCache.set(key, result, defaultOptions);
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
