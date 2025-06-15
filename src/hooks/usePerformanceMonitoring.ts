
import { useState, useEffect } from 'react';
import { logger } from '@/services/loggerService';

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  metadata?: Record<string, any>;
}

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

  const [metrics] = useState<PerformanceMetric[]>([]);

  useEffect(() => {
    const updatePerformanceData = () => {
      try {
        const summary = getMetricsSummary();
        const score = calculatePerformanceScore(summary);
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

        if (alerts.length > 0) {
          logger.warn('Performance alerts detected', { alerts, score }, 'PerformanceMonitoring');
        }
      } catch (error) {
        logger.error('Error updating performance data', { error }, 'PerformanceMonitoring');
        setPerformanceData(prev => ({ ...prev, isLoading: false }));
      }
    };

    // Initial update
    updatePerformanceData();

    // Update every 30 seconds
    const interval = setInterval(updatePerformanceData, 30000);

    return () => clearInterval(interval);
  }, []);

  const getMetricsSummary = (timeRange: number = 300000) => {
    const now = Date.now();
    const recentMetrics = metrics.filter(m => now - m.timestamp < timeRange);
    
    const summary: Record<string, any> = {};
    
    recentMetrics.forEach(metric => {
      if (!summary[metric.name]) {
        summary[metric.name] = {
          count: 0,
          total: 0,
          min: Infinity,
          max: -Infinity,
          avg: 0
        };
      }
      
      const stats = summary[metric.name];
      stats.count++;
      stats.total += metric.value;
      stats.min = Math.min(stats.min, metric.value);
      stats.max = Math.max(stats.max, metric.value);
      stats.avg = stats.total / stats.count;
    });

    return summary;
  };

  const calculatePerformanceScore = (summary: Record<string, any>): number => {
    let score = 100;

    // Deduct points for poor metrics
    if (summary.LCP?.avg > 2500) score -= 20;
    if (summary.FID?.avg > 100) score -= 15;
    if (summary.CLS?.avg > 0.1) score -= 15;
    if (summary.TTFB?.avg > 600) score -= 10;
    if (summary.API_Response_Time?.avg > 1000) score -= 20;
    if (summary.Memory_Used?.avg > 100) score -= 10;

    return Math.max(0, score);
  };

  const trackComponentRender = (componentName: string, renderTime: number) => {
    logger.debug('Component render tracked', { componentName, renderTime }, 'PerformanceMonitoring');
  };

  const trackAPICall = (url: string, startTime: number, endTime: number, status: number) => {
    const duration = endTime - startTime;
    logger.info('API call tracked', { url, duration, status }, 'PerformanceMonitoring');
  };

  const exportPerformanceData = () => {
    const data = {
      metrics,
      summary: getMetricsSummary(),
      score: calculatePerformanceScore(getMetricsSummary()),
      timestamp: Date.now()
    };
    
    logger.info('Performance data exported', { dataSize: metrics.length }, 'PerformanceMonitoring');
    return data;
  };

  return {
    ...performanceData,
    trackComponentRender,
    trackAPICall,
    exportPerformanceData
  };
};
