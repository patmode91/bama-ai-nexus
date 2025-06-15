
import { useQuery } from '@tanstack/react-query';
import { searchCache } from '@/services/cache/advancedCacheService';

interface SearchFilters {
  category?: string;
  location?: string;
  verified?: boolean;
  rating?: number;
  tags?: string[];
}

interface SearchResult {
  id: number;
  businessname: string;
  category: string;
  location: string;
  rating: number;
  verified: boolean;
  description?: string;
  website?: string;
  contactemail?: string;
  tags?: string[];
}

interface CachedSearchHookProps {
  query: string;
  filters?: SearchFilters;
  enabled?: boolean;
}

export const useCachedSearch = ({ query, filters, enabled = true }: CachedSearchHookProps) => {
  const cacheKey = `search:${query}:${JSON.stringify(filters || {})}`;

  return useQuery({
    queryKey: ['cached-search', cacheKey],
    queryFn: async (): Promise<SearchResult[]> => {
      // Try to get from cache first
      const cached = await searchCache.get<SearchResult[]>(cacheKey);
      if (cached) {
        console.log('Cache hit for search:', query);
        return cached;
      }

      console.log('Cache miss, performing search:', query);
      
      // Simulate search API call (replace with actual implementation)
      const mockResults: SearchResult[] = [
        {
          id: 1,
          businessname: `Sample Business for ${query}`,
          category: filters?.category || 'Technology',
          location: filters?.location || 'Birmingham, AL',
          rating: 4.5,
          verified: true,
          description: 'Sample business description',
          tags: ['technology', 'software']
        }
      ];

      // Cache the results with high priority for search results
      await searchCache.set(cacheKey, mockResults, {
        ttl: 10 * 60 * 1000, // 10 minutes
        priority: 'high',
        tags: ['search', 'results']
      });

      return mockResults;
    },
    enabled: enabled && query.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
  });
};

// Enhanced search with real-time updates
export const useRealtimeSearch = ({ query, filters, enabled = true }: CachedSearchHookProps) => {
  const { data: cachedResults, ...queryInfo } = useCachedSearch({ query, filters, enabled });

  const {
    data: realtimeResults,
    isLoading: isRealtimeLoading,
    error: realtimeError
  } = useQuery({
    queryKey: ['realtime-search', query, filters],
    queryFn: async (): Promise<SearchResult[]> => {
      // This would connect to your real-time search service
      // For now, return cached results with simulated updates
      return cachedResults || [];
    },
    enabled: enabled && !!cachedResults,
    refetchInterval: 30000, // Refresh every 30 seconds
    staleTime: 0 // Always consider stale for real-time updates
  });

  return {
    data: realtimeResults || cachedResults,
    isLoading: queryInfo.isLoading || isRealtimeLoading,
    error: queryInfo.error || realtimeError,
    ...queryInfo
  };
};

// Search suggestions with caching
export const useSearchSuggestions = (partialQuery: string) => {
  return useQuery({
    queryKey: ['search-suggestions', partialQuery],
    queryFn: async (): Promise<string[]> => {
      const cacheKey = `suggestions:${partialQuery}`;
      
      // Try cache first
      const cached = await searchCache.get<string[]>(cacheKey);
      if (cached) {
        return cached;
      }

      // Mock suggestions (replace with actual API)
      const suggestions = [
        `${partialQuery} companies`,
        `${partialQuery} services`,
        `${partialQuery} near me`,
        `best ${partialQuery}`,
        `${partialQuery} reviews`
      ].filter(s => s.length > partialQuery.length);

      // Cache suggestions with normal priority
      await searchCache.set(cacheKey, suggestions, {
        ttl: 60 * 60 * 1000, // 1 hour
        priority: 'normal',
        tags: ['suggestions']
      });

      return suggestions;
    },
    enabled: partialQuery.length > 2,
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
};
