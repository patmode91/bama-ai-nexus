
import React, { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { advancedCacheService, businessCache, searchCache, aiCache } from '@/services/cache/advancedCacheService';
import { Zap, Database, Clock, TrendingUp } from 'lucide-react';

interface CacheIndicatorProps {
  cacheType?: 'business' | 'search' | 'ai' | 'general';
  showStats?: boolean;
  compact?: boolean;
}

export const CacheIndicator: React.FC<CacheIndicatorProps> = ({ 
  cacheType = 'general', 
  showStats = false,
  compact = false 
}) => {
  const [stats, setStats] = useState({
    hits: 0,
    misses: 0,
    hitRate: 0,
    size: 0,
    memoryUsage: 0
  });

  useEffect(() => {
    const updateStats = () => {
      let cacheService;
      switch (cacheType) {
        case 'business':
          cacheService = businessCache;
          break;
        case 'search':
          cacheService = searchCache;
          break;
        case 'ai':
          cacheService = aiCache;
          break;
        default:
          cacheService = advancedCacheService;
      }
      
      setStats(cacheService.getStats());
    };

    updateStats();
    const interval = setInterval(updateStats, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [cacheType]);

  const getCacheIcon = () => {
    switch (cacheType) {
      case 'business':
        return <Database className="w-3 h-3" />;
      case 'search':
        return <TrendingUp className="w-3 h-3" />;
      case 'ai':
        return <Zap className="w-3 h-3" />;
      default:
        return <Clock className="w-3 h-3" />;
    }
  };

  const getVariant = () => {
    if (stats.hitRate > 0.8) return 'default';
    if (stats.hitRate > 0.6) return 'secondary';
    return 'outline';
  };

  const formatMemory = (mb: number) => {
    if (mb < 1) return `${(mb * 1024).toFixed(0)}KB`;
    return `${mb.toFixed(1)}MB`;
  };

  if (compact) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge variant={getVariant()} className="flex items-center gap-1 text-xs">
              {getCacheIcon()}
              {(stats.hitRate * 100).toFixed(0)}%
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <div className="text-sm">
              <div className="font-medium">{cacheType} Cache Performance</div>
              <div>Hit Rate: {(stats.hitRate * 100).toFixed(1)}%</div>
              <div>Size: {stats.size} items</div>
              <div>Memory: {formatMemory(stats.memoryUsage)}</div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Badge variant={getVariant()} className="flex items-center gap-1">
        {getCacheIcon()}
        Cache: {(stats.hitRate * 100).toFixed(1)}%
      </Badge>
      
      {showStats && (
        <div className="text-xs text-muted-foreground flex items-center gap-3">
          <span>{stats.hits} hits</span>
          <span>{stats.misses} misses</span>
          <span>{stats.size} items</span>
          <span>{formatMemory(stats.memoryUsage)}</span>
        </div>
      )}
    </div>
  );
};

export default CacheIndicator;
