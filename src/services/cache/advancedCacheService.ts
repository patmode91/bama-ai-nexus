
import { AdvancedCacheOperations } from './advancedCacheOperations';

// Create and export cache instances
export const advancedCacheService = new AdvancedCacheOperations();
export const businessCache = new AdvancedCacheOperations();
export const searchCache = new AdvancedCacheOperations();
export const aiCache = new AdvancedCacheOperations();

// Re-export types for backward compatibility
export type { CacheOptions, CacheStats, StaleWhileRevalidateOptions } from './types';
