
import { performanceMonitor } from '../performanceMonitor';
import { OptimizationSuggestion } from './types';

export const generateOptimizationSuggestions = (): OptimizationSuggestion[] => {
  const metrics = performanceMonitor.getMetricsSummary();
  const suggestions: OptimizationSuggestion[] = [];

  if ((metrics.LCP?.avg || 0) > 2500) {
    suggestions.push({
      type: 'LCP',
      message: 'Optimize images and reduce render-blocking resources',
      priority: 'high'
    });
  }

  if ((metrics.FID?.avg || 0) > 100) {
    suggestions.push({
      type: 'FID',
      message: 'Break up long-running tasks and optimize JavaScript execution',
      priority: 'high'
    });
  }

  if ((metrics.CLS?.avg || 0) > 0.1) {
    suggestions.push({
      type: 'CLS',
      message: 'Set explicit dimensions for images and avoid dynamic content insertion',
      priority: 'medium'
    });
  }

  return suggestions;
};
