
export interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  priority?: 'low' | 'medium' | 'high';
  tags?: string[];
}

export interface CacheItem {
  data: any;
  timestamp: number;
  lastAccessed: number;
  ttl: number;
  priority: 'low' | 'medium' | 'high';
  tags: string[];
}

export interface CacheStats {
  hitRate: number;
  size: number;
  maxSize: number;
  totalHits: number;
  totalMisses: number;
}
