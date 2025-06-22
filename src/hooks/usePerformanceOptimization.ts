
import { useState, useEffect, useCallback } from 'react';
import { logger } from '@/services/loggerService';

interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  interactionTime: number;
  memoryUsage: number;
  cacheHitRate: number;
}

interface OptimizationSuggestions {
  type: 'cache' | 'memory' | 'render' | 'network';
  message: string;
  severity: 'info' | 'warning' | 'error';
  action?: string;
}

export const usePerformanceOptimization = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    loadTime: 0,
    renderTime: 0,
    interactionTime: 0,
    memoryUsage: 0,
    cacheHitRate: 0
  });
  const [suggestions, setSuggestions] = useState<OptimizationSuggestions[]>([]);
  const [isOptimizing, setIsOptimizing] = useState(false);

  const measurePerformance = useCallback(() => {
    // Measure page load time
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const loadTime = navigation.loadEventEnd - navigation.loadEventStart;

    // Measure memory usage if available
    const memoryInfo = (performance as any).memory;
    const memoryUsage = memoryInfo ? memoryInfo.usedJSHeapSize / 1024 / 1024 : 0;

    // Get render timing
    const paintEntries = performance.getEntriesByType('paint');
    const renderTime = paintEntries.length > 0 ? paintEntries[paintEntries.length - 1].startTime : 0;

    setMetrics(prev => ({
      ...prev,
      loadTime,
      renderTime,
      memoryUsage,
      interactionTime: Date.now() - performance.timeOrigin
    }));

    // Generate optimization suggestions
    generateSuggestions({ loadTime, renderTime, memoryUsage });
  }, []);

  const generateSuggestions = (currentMetrics: Partial<PerformanceMetrics>) => {
    const newSuggestions: OptimizationSuggestions[] = [];

    if (currentMetrics.loadTime && currentMetrics.loadTime > 3000) {
      newSuggestions.push({
        type: 'network',
        message: 'Page load time is slow. Consider optimizing images and reducing bundle size.',
        severity: 'warning',
        action: 'Enable image optimization and code splitting'
      });
    }

    if (currentMetrics.memoryUsage && currentMetrics.memoryUsage > 50) {
      newSuggestions.push({
        type: 'memory',
        message: 'High memory usage detected. Consider cleaning up unused resources.',
        severity: 'warning',
        action: 'Implement memory cleanup in useEffect hooks'
      });
    }

    if (currentMetrics.renderTime && currentMetrics.renderTime > 2000) {
      newSuggestions.push({
        type: 'render',
        message: 'Slow render time detected. Consider using React.memo for heavy components.',
        severity: 'info',
        action: 'Add React.memo to frequently re-rendering components'
      });
    }

    setSuggestions(newSuggestions);
  };

  const optimizePerformance = useCallback(async () => {
    setIsOptimizing(true);
    try {
      // Clear unnecessary caches
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        const oldCaches = cacheNames.filter(name => !name.includes('bamaai-connect-v1'));
        await Promise.all(oldCaches.map(name => caches.delete(name)));
      }

      // Garbage collection hint (if available)
      if ((window as any).gc) {
        (window as any).gc();
      }

      // Log optimization action
      logger.info('Performance optimization completed', { 
        suggestions: suggestions.length,
        memoryBefore: metrics.memoryUsage 
      }, 'PerformanceOptimization');

      // Re-measure after optimization
      setTimeout(measurePerformance, 1000);
    } catch (error) {
      logger.error('Performance optimization failed', { error }, 'PerformanceOptimization');
    } finally {
      setIsOptimizing(false);
    }
  }, [suggestions, metrics.memoryUsage, measurePerformance]);

  useEffect(() => {
    // Initial measurement
    const timer = setTimeout(measurePerformance, 2000);
    
    // Set up periodic monitoring
    const interval = setInterval(measurePerformance, 30000);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [measurePerformance]);

  return {
    metrics,
    suggestions,
    isOptimizing,
    optimizePerformance,
    measurePerformance
  };
};
