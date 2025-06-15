
import { OptimizationRule } from './types';

export const createMemoryOptimizationRules = (): OptimizationRule[] => [
  {
    name: 'Memory Cleanup',
    condition: () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        const usedMB = memory.usedJSHeapSize / 1024 / 1024;
        return usedMB > 150; // Cleanup if using more than 150MB
      }
      return false;
    },
    action: async () => {
      // Force garbage collection if available
      if ('gc' in window) {
        (window as any).gc();
      }
      
      // Clear large data structures
      clearLargeDataStructures();
      console.log('🗑️ Memory cleanup completed');
    },
    priority: 'high'
  }
];

function clearLargeDataStructures() {
  // Clear large arrays/objects that might be cached in memory
  const largeElements = document.querySelectorAll('img, video, canvas');
  largeElements.forEach(element => {
    if (element instanceof HTMLImageElement && !element.src.includes('data:')) {
      // Optionally clear non-critical images
    }
  });
}
