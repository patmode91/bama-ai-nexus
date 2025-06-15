
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, Zap } from 'lucide-react';
import { CacheStats } from '@/services/cache/types';

interface CachePerformanceTabProps {
  cacheStats: {
    main: CacheStats;
    business: CacheStats;
    search: CacheStats;
    ai: CacheStats;
  };
}

export const CachePerformanceTab: React.FC<CachePerformanceTabProps> = ({ cacheStats }) => {
  const getHitRateColor = (hitRate: number) => {
    if (hitRate >= 80) return 'text-green-500';
    if (hitRate >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const generateAlerts = () => {
    const alerts: string[] = [];
    
    Object.entries(cacheStats).forEach(([key, stats]) => {
      if (stats.hitRate < 50) {
        alerts.push(`${key} cache hit rate is low (${stats.hitRate.toFixed(1)}%)`);
      }
      if (stats.size > 800) {
        alerts.push(`${key} cache is approaching capacity (${stats.size}/1000)`);
      }
      if (stats.evictions > 50) {
        alerts.push(`${key} cache has high eviction rate (${stats.evictions})`);
      }
    });
    
    return alerts;
  };

  const alerts = generateAlerts();

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Hit Rate Analysis */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Cache Hit Rate Analysis</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(cacheStats).map(([key, stats]) => (
            <div key={key} className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-300 capitalize">{key} Cache</span>
                <span className={`font-semibold ${getHitRateColor(stats.hitRate)}`}>
                  {stats.hitRate.toFixed(1)}%
                </span>
              </div>
              <Progress value={stats.hitRate} className="h-2" />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Performance Alerts */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Performance Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {alerts.length > 0 ? (
              alerts.map((alert, index) => (
                <div key={index} className="flex items-center space-x-2 text-yellow-400">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-sm">{alert}</span>
                </div>
              ))
            ) : (
              <div className="flex items-center space-x-2 text-green-400">
                <Zap className="w-4 h-4" />
                <span className="text-sm">All caches performing optimally</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
