
import { cacheService } from '../cacheService';
import { OptimizationRule } from './types';

export const createCacheOptimizationRules = (): OptimizationRule[] => [
  {
    name: 'Clear Expired Cache',
    condition: () => {
      const stats = cacheService.getStats();
      return stats.size > 100; // Clear cache if too many items
    },
    action: async () => {
      cacheService.cleanup();
      console.log('🧹 Cache cleanup completed');
    },
    priority: 'medium'
  }
];
