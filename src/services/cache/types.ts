
export interface CacheOptions {
  ttl?: number;
  priority?: 'low' | 'medium' | 'high';
  tags?: string[];
  compress?: boolean;
}

export interface CacheItem<T = any> {
  data: T;
  timestamp: number;
  lastAccessed: number;
  ttl: number;
  priority: 'low' | 'medium' | 'high';
  tags: string[];
  accessCount: number;
  compressed: boolean;
  expiresAt: number;
}

export interface CacheStats {
  hitRate: number;
  size: number;
  maxSize: number;
  totalHits: number;
  totalMisses: number;
  totalRequests: number;
  hits: number;
  misses: number;
  evictions: number;
  memoryUsage: number;
  expiredEntries: number;
}

export interface StaleWhileRevalidateOptions {
  staleTime: number;
  maxAge: number;
  freshTTL: number;
  staleTTL: number;
  revalidateOnFocus?: boolean;
  revalidateOnReconnect?: boolean;
}
