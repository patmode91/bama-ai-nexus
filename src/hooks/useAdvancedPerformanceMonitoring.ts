
import { useState, useEffect, useCallback } from 'react';
import { performanceMonitor } from '@/services/performanceMonitor';
import { logger } from '@/services/loggerService';

interface PerformanceAlert {
  id: string;
  type: 'warning' | 'error' | 'info';
  message: string;
  timestamp: number;
  resolved: boolean;
}

interface PerformanceThresholds {
  renderTime: number;
  memoryUsage: number;
  apiResponseTime: number;
  errorRate: number;
}

export const useAdvancedPerformanceMonitoring = () => {
  const [alerts, setAlerts] = useState<PerformanceAlert[]>([]);
  const [thresholds, setThresholds] = useState<PerformanceThresholds>({
    renderTime: 16,
    memoryUsage: 100,
    apiResponseTime: 1000,
    errorRate: 0.05
  });
  const [isMonitoring, setIsMonitoring] = useState(false);

  const addAlert = useCallback((type: PerformanceAlert['type'], message: string) => {
    const alert: PerformanceAlert = {
      id: `alert-${Date.now()}-${Math.random()}`,
      type,
      message,
      timestamp: Date.now(),
      resolved: false
    };
    
    setAlerts(prev => [...prev.slice(-19), alert]); // Keep last 20 alerts
    logger.warn('Performance alert', { alert }, 'AdvancedPerformanceMonitoring');
  }, []);

  const resolveAlert = useCallback((alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, resolved: true } : alert
    ));
  }, []);

  const updateThresholds = useCallback((newThresholds: Partial<PerformanceThresholds>) => {
    setThresholds(prev => ({ ...prev, ...newThresholds }));
  }, []);

  const startMonitoring = useCallback(() => {
    setIsMonitoring(true);
    
    const checkPerformance = () => {
      const metrics = performanceMonitor.getMetricsSummary();
      
      // Check render time
      if (metrics.Component_Render?.avg > thresholds.renderTime) {
        addAlert('warning', `Component render time exceeds ${thresholds.renderTime}ms`);
      }
      
      // Check memory usage
      if (metrics.Memory_Used?.avg > thresholds.memoryUsage) {
        addAlert('error', `Memory usage exceeds ${thresholds.memoryUsage}MB`);
      }
      
      // Check API response time
      if (metrics.API_Response_Time?.avg > thresholds.apiResponseTime) {
        addAlert('warning', `API response time exceeds ${thresholds.apiResponseTime}ms`);
      }
      
      // Check overall performance score
      const score = performanceMonitor.calculatePerformanceScore();
      if (score < 50) {
        addAlert('error', `Performance score critically low: ${score}/100`);
      } else if (score < 70) {
        addAlert('warning', `Performance score below threshold: ${score}/100`);
      }
    };

    const interval = setInterval(checkPerformance, 10000); // Check every 10 seconds
    
    return () => {
      clearInterval(interval);
      setIsMonitoring(false);
    };
  }, [thresholds, addAlert]);

  const getPerformanceReport = useCallback(() => {
    const metrics = performanceMonitor.getMetricsSummary();
    const score = performanceMonitor.calculatePerformanceScore();
    
    return {
      score,
      metrics,
      alerts: alerts.filter(alert => !alert.resolved),
      recommendations: performanceMonitor.exportMetrics()
    };
  }, [alerts]);

  useEffect(() => {
    const cleanup = startMonitoring();
    return cleanup;
  }, [startMonitoring]);

  return {
    alerts,
    thresholds,
    isMonitoring,
    addAlert,
    resolveAlert,
    updateThresholds,
    startMonitoring,
    getPerformanceReport
  };
};
