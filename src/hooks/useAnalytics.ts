
import { useQuery } from '@tanstack/react-query';
import { analyticsService } from '@/services/analytics/analyticsService';

export const useAnalytics = () => {
  const {
    data: metrics,
    isLoading: isLoadingMetrics,
    error: metricsError,
    refetch: refetchMetrics
  } = useQuery({
    queryKey: ['analytics-metrics'],
    queryFn: () => analyticsService.getOverviewMetrics(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false
  });

  const {
    data: categoryInsights,
    isLoading: isLoadingCategories,
    error: categoriesError
  } = useQuery({
    queryKey: ['analytics-categories'],
    queryFn: () => analyticsService.getCategoryInsights(),
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false
  });

  const {
    data: locationInsights,
    isLoading: isLoadingLocations,
    error: locationsError
  } = useQuery({
    queryKey: ['analytics-locations'],
    queryFn: () => analyticsService.getLocationInsights(),
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false
  });

  const {
    data: marketIntelligence,
    isLoading: isLoadingIntelligence,
    error: intelligenceError
  } = useQuery({
    queryKey: ['market-intelligence'],
    queryFn: () => analyticsService.getMarketIntelligence(),
    staleTime: 15 * 60 * 1000, // 15 minutes
    refetchOnWindowFocus: false
  });

  const trackEvent = async (eventType: string, metadata?: any, businessId?: number) => {
    try {
      await analyticsService.trackEvent(eventType, metadata, businessId);
    } catch (error) {
      console.error('Event tracking failed:', error);
    }
  };

  const getTrendData = (metric: string, period: 'week' | 'month' | 'quarter' = 'month') => {
    return useQuery({
      queryKey: ['analytics-trends', metric, period],
      queryFn: () => analyticsService.getTrendData(metric, period),
      staleTime: 30 * 60 * 1000, // 30 minutes
      refetchOnWindowFocus: false
    });
  };

  return {
    // Data
    metrics,
    categoryInsights,
    locationInsights,
    marketIntelligence,
    
    // Loading states
    isLoadingMetrics,
    isLoadingCategories,
    isLoadingLocations,
    isLoadingIntelligence,
    isLoading: isLoadingMetrics || isLoadingCategories || isLoadingLocations || isLoadingIntelligence,
    
    // Errors
    metricsError,
    categoriesError,
    locationsError,
    intelligenceError,
    
    // Actions
    trackEvent,
    getTrendData,
    refetchMetrics
  };
};
