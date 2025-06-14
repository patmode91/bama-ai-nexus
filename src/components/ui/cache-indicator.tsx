
import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Database, Zap, Clock } from 'lucide-react';
import { advancedCacheService } from '@/services/advancedCacheService';

interface CacheIndicatorProps {
  cacheKey?: string;
  showStats?: boolean;
  className?: string;
}

export const CacheIndicator = ({ 
  cacheKey, 
  showStats = false, 
  className = "" 
}: CacheIndicatorProps) => {
  const [cacheStatus, setCacheStatus] = useState<'hit' | 'miss' | 'loading' | 'unknown'>('unknown');
  const [cacheStats, setCacheStats] = useState(advancedCacheService.getStats());

  useEffect(() => {
    const updateStats = () => {
      setCacheStats(advancedCacheService.getStats());
    };

    // Update stats every 5 seconds
    const interval = setInterval(updateStats, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (cacheKey) {
      // Check if key exists in cache
      const checkCache = async () => {
        const cached = await advancedCacheService.get(cacheKey);
        setCacheStatus(cached ? 'hit' : 'miss');
      };
      checkCache();
    }
  }, [cacheKey]);

  const getCacheIcon = () => {
    switch (cacheStatus) {
      case 'hit':
        return <Zap className="w-3 h-3" />;
      case 'miss':
        return <Clock className="w-3 h-3" />;
      case 'loading':
        return <Database className="w-3 h-3 animate-pulse" />;
      default:
        return <Database className="w-3 h-3" />;
    }
  };

  const getCacheColor = () => {
    switch (cacheStatus) {
      case 'hit':
        return 'bg-green-500';
      case 'miss':
        return 'bg-yellow-500';
      case 'loading':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getCacheText = () => {
    switch (cacheStatus) {
      case 'hit':
        return 'Cached';
      case 'miss':
        return 'Fresh';
      case 'loading':
        return 'Loading';
      default:
        return 'Cache';
    }
  };

  if (!showStats && !cacheKey) return null;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge className={`${getCacheColor()} text-white ${className}`}>
            {getCacheIcon()}
            <span className="ml-1 text-xs">{getCacheText()}</span>
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <div className="space-y-1 text-xs">
            {cacheKey && (
              <div>Cache Key: {cacheKey}</div>
            )}
            <div>Hit Rate: {cacheStats.hitRate.toFixed(1)}%</div>
            <div>Total Requests: {cacheStats.totalRequests}</div>
            <div>Cache Size: {cacheStats.size} items</div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default CacheIndicator;
