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

  // Enhanced user engagement analytics
  const {
    data: userEngagement,
    isLoading: isLoadingEngagement,
    error: engagementError
  } = useQuery({
    queryKey: ['user-engagement'],
    queryFn: () => analyticsService.getUserEngagementMetrics(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false
  });

  // Performance benchmarking
  const {
    data: benchmarks,
    isLoading: isLoadingBenchmarks,
    error: benchmarksError
  } = useQuery({
    queryKey: ['performance-benchmarks'],
    queryFn: () => analyticsService.getPerformanceBenchmarks(),
    staleTime: 30 * 60 * 1000, // 30 minutes
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

  // Advanced analytics exports
  const exportAnalytics = async (format: 'json' | 'csv' | 'pdf' = 'json') => {
    try {
      const data = {
        metrics,
        categoryInsights,
        locationInsights,
        marketIntelligence,
        userEngagement,
        benchmarks,
        exportedAt: new Date().toISOString(),
        format
      };
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { 
        type: format === 'json' ? 'application/json' : 'text/csv' 
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `alabama-analytics-${new Date().toISOString().split('T')[0]}.${format}`;
      link.click();
      URL.revokeObjectURL(url);
      
      return true;
    } catch (error) {
      console.error('Export failed:', error);
      return false;
    }
  };

  return {
    // Data
    metrics,
    categoryInsights,
    locationInsights,
    marketIntelligence,
    userEngagement,
    benchmarks,
    
    // Loading states
    isLoadingMetrics,
    isLoadingCategories,
    isLoadingLocations,
    isLoadingIntelligence,
    isLoadingEngagement,
    isLoadingBenchmarks,
    isLoading: isLoadingMetrics || isLoadingCategories || isLoadingLocations || 
                isLoadingIntelligence || isLoadingEngagement || isLoadingBenchmarks,
    
    // Errors
    metricsError,
    categoriesError,
    locationsError,
    intelligenceError,
    engagementError,
    benchmarksError,
    
    // Actions
    trackEvent,
    getTrendData,
    refetchMetrics,
    exportAnalytics
  };
};

// Export the trackEvent function separately for convenience
export const useTrackEvent = () => {
  const trackEvent = async (eventType: string, metadata?: any, businessId?: number) => {
    try {
      await analyticsService.trackEvent(eventType, metadata, businessId);
    } catch (error) {
      console.error('Event tracking failed:', error);
    }
  };
  
  return trackEvent;
};
