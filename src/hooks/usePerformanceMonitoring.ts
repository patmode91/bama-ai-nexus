
import { useState, useEffect } from 'react';
import { performanceMonitor } from '@/services/performanceMonitor';

interface PerformanceData {
  score: number;
  metrics: Record<string, any>;
  isLoading: boolean;
  alerts: string[];
}

export const usePerformanceMonitoring = () => {
  const [performanceData, setPerformanceData] = useState<PerformanceData>({
    score: 100,
    metrics: {},
    isLoading: true,
    alerts: []
  });

  useEffect(() => {
    const updatePerformanceData = () => {
      const summary = performanceMonitor.getMetricsSummary();
      const score = performanceMonitor.calculatePerformanceScore();
      const alerts: string[] = [];

      // Generate alerts based on performance thresholds
      if (summary.LCP?.avg > 2500) {
        alerts.push('Largest Contentful Paint is slow (>2.5s)');
      }
      if (summary.FID?.avg > 100) {
        alerts.push('First Input Delay is high (>100ms)');
      }
      if (summary.API_Response_Time?.avg > 1000) {
        alerts.push('API response times are slow (>1s)');
      }
      if (summary.Memory_Used?.avg > 100) {
        alerts.push('High memory usage detected (>100MB)');
      }

      setPerformanceData({
        score,
        metrics: summary,
        isLoading: false,
        alerts
      });
    };

    // Initial update
    updatePerformanceData();

    // Update every 30 seconds
    const interval = setInterval(updatePerformanceData, 30000);

    return () => clearInterval(interval);
  }, []);

  const trackComponentRender = (componentName: string, renderTime: number) => {
    performanceMonitor.trackComponentRender(componentName, renderTime);
  };

  const trackAPICall = (url: string, startTime: number, endTime: number, status: number) => {
    performanceMonitor.monitorAPICall(url, startTime, endTime, status);
  };

  const exportPerformanceData = () => {
    return performanceMonitor.exportMetrics();
  };

  return {
    ...performanceData,
    trackComponentRender,
    trackAPICall,
    exportPerformanceData
  };
};
