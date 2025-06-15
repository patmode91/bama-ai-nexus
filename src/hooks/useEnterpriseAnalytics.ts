
import { useState, useEffect, useCallback } from 'react';
import { enterpriseAnalyticsService } from '@/services/analytics/enterpriseAnalyticsService';

export const useEnterpriseAnalytics = () => {
  const [isTracking, setIsTracking] = useState(false);
  const [overview, setOverview] = useState<any>(null);

  useEffect(() => {
    setIsTracking(true);
    loadOverview();
  }, []);

  const loadOverview = useCallback(() => {
    const analyticsOverview = enterpriseAnalyticsService.getAnalyticsOverview();
    setOverview(analyticsOverview);
  }, []);

  const trackEvent = useCallback((event: string, properties: Record<string, any> = {}) => {
    enterpriseAnalyticsService.trackEvent(event, properties);
    loadOverview(); // Refresh overview after tracking
  }, [loadOverview]);

  const recordMetric = useCallback((metricName: string, value: number, metadata?: Record<string, any>) => {
    enterpriseAnalyticsService.recordMetric(metricName, value, metadata);
  }, []);

  const generateReport = useCallback((type: 'revenue' | 'engagement' | 'growth' | 'market' | 'performance', timeRange?: { start: number; end: number }) => {
    return enterpriseAnalyticsService.generateBusinessIntelligenceReport(type, timeRange);
  }, []);

  const exportData = useCallback(() => {
    return enterpriseAnalyticsService.exportAnalyticsData();
  }, []);

  return {
    isTracking,
    overview,
    trackEvent,
    recordMetric,
    generateReport,
    exportData,
    loadOverview
  };
};
