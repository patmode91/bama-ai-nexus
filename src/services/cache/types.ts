
export interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
  accessCount: number;
  lastAccessed: number;
  priority: 'low' | 'medium' | 'high';
  tags: string[];
  compressed?: boolean;
}

export interface CacheOptions {
  ttl?: number;
  priority?: 'low' | 'medium' | 'high';
  tags?: string[];
  compress?: boolean;
}

export interface CacheStats {
  hits: number;
  misses: number;
  size: number;
  memoryUsage: number;
  hitRate: number;
  totalRequests: number;
  evictions: number;
  maxSize: number;
  expiredEntries: number;
  entriesByPriority: {
    high: number;
    normal: number;
    low: number;
  };
}

export interface StaleWhileRevalidateOptions {
  staleTTL: number;
  freshTTL: number;
}
