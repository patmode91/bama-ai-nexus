
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trash2 } from 'lucide-react';
import { CacheStats } from '@/services/cache/types';

interface CacheStatsCardProps {
  title: string;
  stats: CacheStats;
  cacheType: string;
  icon: React.ComponentType<{ className?: string }>;
  onClear: (cacheType: string) => void;
}

export const CacheStatsCard: React.FC<CacheStatsCardProps> = ({ 
  title, 
  stats, 
  cacheType, 
  icon: Icon, 
  onClear 
}) => {
  const getHitRateBadge = (hitRate: number) => {
    if (hitRate >= 80) return 'bg-green-500';
    if (hitRate >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center text-white">
          <Icon className="w-5 h-5 mr-2 text-[#00C2FF]" />
          {title}
          <Badge className={`ml-auto ${getHitRateBadge(stats.hitRate)} text-white`}>
            {stats.hitRate.toFixed(1)}% Hit Rate
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="text-sm text-gray-400">Cache Size</div>
            <div className="text-2xl font-bold text-white">{stats.size}</div>
            <Progress value={(stats.size / 1000) * 100} className="h-2" />
          </div>
          <div className="space-y-2">
            <div className="text-sm text-gray-400">Total Requests</div>
            <div className="text-2xl font-bold text-white">{stats.totalRequests.toLocaleString()}</div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="space-y-1">
            <div className="text-sm text-gray-400">Hits</div>
            <div className="text-lg font-semibold text-green-400">{stats.hits}</div>
          </div>
          <div className="space-y-1">
            <div className="text-sm text-gray-400">Misses</div>
            <div className="text-lg font-semibold text-red-400">{stats.misses}</div>
          </div>
          <div className="space-y-1">
            <div className="text-sm text-gray-400">Evictions</div>
            <div className="text-lg font-semibold text-yellow-400">{stats.evictions}</div>
          </div>
        </div>

        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onClear(cacheType)}
            className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            <Trash2 className="w-3 h-3 mr-1" />
            Clear
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
