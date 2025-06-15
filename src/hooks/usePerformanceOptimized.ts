
import { useState, useEffect, useCallback, useRef } from 'react';
import { logger } from '@/services/loggerService';

interface PerformanceMetrics {
  renderTime: number;
  memoryUsage: number;
  componentMountTime: number;
  updateCount: number;
  errorCount: number;
}

interface PerformanceData {
  metrics: PerformanceMetrics;
  isOptimal: boolean;
  warnings: string[];
  suggestions: string[];
}

export const usePerformanceOptimized = (componentName: string) => {
  const [performanceData, setPerformanceData] = useState<PerformanceData>({
    metrics: {
      renderTime: 0,
      memoryUsage: 0,
      componentMountTime: 0,
      updateCount: 0,
      errorCount: 0
    },
    isOptimal: true,
    warnings: [],
    suggestions: []
  });

  const mountTimeRef = useRef<number>(Date.now());
  const updateCountRef = useRef<number>(0);
  const errorCountRef = useRef<number>(0);
  const lastRenderTimeRef = useRef<number>(0);

  // Track component mount time
  useEffect(() => {
    const mountTime = Date.now() - mountTimeRef.current;
    
    setPerformanceData(prev => ({
      ...prev,
      metrics: {
        ...prev.metrics,
        componentMountTime: mountTime
      }
    }));

    logger.debug(`Component ${componentName} mounted`, { mountTime }, 'Performance');

    return () => {
      logger.debug(`Component ${componentName} unmounted`, { 
        totalUpdates: updateCountRef.current,
        totalErrors: errorCountRef.current 
      }, 'Performance');
    };
  }, [componentName]);

  // Track render performance
  useEffect(() => {
    const renderStart = performance.now();
    updateCountRef.current++;

    // Measure render time
    const renderTime = performance.now() - renderStart;
    lastRenderTimeRef.current = renderTime;

    // Get memory usage if available
    const memoryUsage = 'memory' in performance 
      ? (performance as any).memory?.usedJSHeapSize / 1024 / 1024 
      : 0;

    const warnings: string[] = [];
    const suggestions: string[] = [];

    // Performance analysis
    if (renderTime > 16) { // 60fps threshold
      warnings.push(`Slow render detected: ${renderTime.toFixed(2)}ms`);
      suggestions.push('Consider memoizing heavy computations');
    }

    if (updateCountRef.current > 50) {
      warnings.push(`High update count: ${updateCountRef.current}`);
      suggestions.push('Check for unnecessary re-renders');
    }

    if (memoryUsage > 50) {
      warnings.push(`High memory usage: ${memoryUsage.toFixed(2)}MB`);
      suggestions.push('Check for memory leaks');
    }

    setPerformanceData({
      metrics: {
        renderTime,
        memoryUsage,
        componentMountTime: performanceData.metrics.componentMountTime,
        updateCount: updateCountRef.current,
        errorCount: errorCountRef.current
      },
      isOptimal: warnings.length === 0,
      warnings,
      suggestions
    });
  });

  const trackError = useCallback((error: Error) => {
    errorCountRef.current++;
    logger.error(`Error in ${componentName}`, { error: error.message }, 'Performance');
  }, [componentName]);

  const trackCustomMetric = useCallback((metricName: string, value: number) => {
    logger.info(`Custom metric ${metricName} in ${componentName}`, { value }, 'Performance');
  }, [componentName]);

  return {
    performanceData,
    trackError,
    trackCustomMetric
  };
};
