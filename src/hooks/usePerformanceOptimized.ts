
import { useState, useEffect, useCallback, useRef } from 'react';
import { logger } from '@/services/loggerService';

interface PerformanceMetrics {
  renderTime: number;
  memoryUsage: number;
  componentSize: number;
  reRenderCount: number;
}

interface PerformanceData {
  metrics: PerformanceMetrics;
  warnings: string[];
  isOptimal: boolean;
  recommendations: string[];
}

export const usePerformanceOptimized = (componentName: string) => {
  const [performanceData, setPerformanceData] = useState<PerformanceData>({
    metrics: { renderTime: 0, memoryUsage: 0, componentSize: 0, reRenderCount: 0 },
    warnings: [],
    isOptimal: true,
    recommendations: []
  });
  
  const renderStartTime = useRef<number>(0);
  const renderCount = useRef<number>(0);
  const lastMemoryUsage = useRef<number>(0);

  useEffect(() => {
    renderStartTime.current = performance.now();
    renderCount.current += 1;
  });

  useEffect(() => {
    const renderEndTime = performance.now();
    const renderTime = renderEndTime - renderStartTime.current;
    
    // Get memory usage if available
    const memoryUsage = (performance as any).memory?.usedJSHeapSize || 0;
    const memoryDelta = memoryUsage - lastMemoryUsage.current;
    lastMemoryUsage.current = memoryUsage;

    const metrics: PerformanceMetrics = {
      renderTime,
      memoryUsage: memoryUsage / 1024 / 1024, // Convert to MB
      componentSize: memoryDelta / 1024, // Convert to KB
      reRenderCount: renderCount.current
    };

    const warnings: string[] = [];
    const recommendations: string[] = [];

    // Performance analysis
    if (renderTime > 16) { // 60fps threshold
      warnings.push(`Slow render time: ${renderTime.toFixed(2)}ms`);
      recommendations.push('Consider memoization or component splitting');
    }

    if (renderCount.current > 10) {
      warnings.push(`High re-render count: ${renderCount.current}`);
      recommendations.push('Check for unnecessary state updates or prop changes');
    }

    if (memoryDelta > 1024) { // 1MB
      warnings.push(`High memory usage: ${(memoryDelta / 1024).toFixed(2)}MB`);
      recommendations.push('Consider lazy loading or data virtualization');
    }

    setPerformanceData({
      metrics,
      warnings,
      isOptimal: warnings.length === 0,
      recommendations
    });

    // Log performance data in development
    if (import.meta.env.DEV) {
      logger.info('Performance metrics', { 
        component: componentName, 
        metrics 
      }, 'usePerformanceOptimized');
    }
  });

  const trackError = useCallback((error: Error) => {
    logger.error('Component error', { 
      component: componentName, 
      error: error.message 
    }, 'usePerformanceOptimized');
  }, [componentName]);

  const optimizeComponent = useCallback(() => {
    // Reset render count for fresh analysis
    renderCount.current = 0;
  }, []);

  return {
    performanceData,
    trackError,
    optimizeComponent
  };
};
