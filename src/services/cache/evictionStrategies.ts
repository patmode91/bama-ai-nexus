
import { CacheItem } from './types';

export const lruEviction = (cache: Map<string, CacheItem<any>>, evictionCount: number): void => {
  const entries = Array.from(cache.entries());
  
  // Sort by priority (low first) then by last accessed time
  entries.sort(([, a], [, b]) => {
    const priorityWeight = { low: 1, medium: 2, high: 3 };
    const priorityDiff = priorityWeight[a.priority] - priorityWeight[b.priority];
    
    if (priorityDiff !== 0) {
      return priorityDiff;
    }
    
    return a.lastAccessed - b.lastAccessed;
  });

  // Remove the least important entries
  for (let i = 0; i < evictionCount && i < entries.length; i++) {
    cache.delete(entries[i][0]);
  }
};

export const cleanupExpired = (cache: Map<string, CacheItem<any>>): number => {
  const now = Date.now();
  let cleaned = 0;
  
  for (const [key, item] of cache.entries()) {
    if (now > item.expiresAt) {
      cache.delete(key);
      cleaned++;
    }
  }
  
  return cleaned;
};

export const isExpired = (entry: CacheItem<any>): boolean => {
  return Date.now() > entry.expiresAt;
};
