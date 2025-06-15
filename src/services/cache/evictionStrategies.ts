
import { CacheItem } from './types';

export const lruEviction = (cache: Map<string, CacheItem<any>>, evictionCount: number): void => {
  const entries = Array.from(cache.entries());
  entries.sort((a, b) => {
    const priorityWeight = { low: 1, medium: 2, high: 3 };
    const aPriority = priorityWeight[a[1].priority];
    const bPriority = priorityWeight[b[1].priority];
    
    if (aPriority !== bPriority) {
      return aPriority - bPriority; // Lower priority first
    }
    
    return a[1].lastAccessed - b[1].lastAccessed; // Then by LRU
  });

  for (let i = 0; i < evictionCount; i++) {
    if (entries[i]) {
      cache.delete(entries[i][0]);
    }
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
