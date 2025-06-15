
import { CacheStatsCard } from './CacheStatsCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Database, Activity, TrendingUp, Zap } from 'lucide-react';
import { CacheStats } from '@/services/cache/types';

interface CacheOverviewTabProps {
  cacheStats: {
    main: CacheStats;
    business: CacheStats;
    search: CacheStats;
    ai: CacheStats;
  };
  onClearCache: (cacheType: string) => void;
}

export const CacheOverviewTab: React.FC<CacheOverviewTabProps> = ({ cacheStats, onClearCache }) => {
  return (
    <div className="space-y-6">
      {/* Cache Statistics Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <CacheStatsCard
          title="Main Cache"
          stats={cacheStats.main}
          cacheType="main"
          icon={Database}
          onClear={onClearCache}
        />
        <CacheStatsCard
          title="Business Cache"
          stats={cacheStats.business}
          cacheType="business"
          icon={Activity}
          onClear={onClearCache}
        />
        <CacheStatsCard
          title="Search Cache"
          stats={cacheStats.search}
          cacheType="search"
          icon={TrendingUp}
          onClear={onClearCache}
        />
        <CacheStatsCard
          title="AI Cache"
          stats={cacheStats.ai}
          cacheType="ai"
          icon={Zap}
          onClear={onClearCache}
        />
      </div>

      {/* Overall Performance Summary */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">System Performance Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold text-[#00C2FF]">
                {Object.values(cacheStats).reduce((acc, stat) => acc + stat.totalRequests, 0).toLocaleString()}
              </div>
              <div className="text-sm text-gray-400">Total Requests</div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold text-green-400">
                {(Object.values(cacheStats).reduce((acc, stat) => acc + stat.hits, 0) / 
                  Object.values(cacheStats).reduce((acc, stat) => acc + stat.totalRequests, 0) * 100 || 0).toFixed(1)}%
              </div>
              <div className="text-sm text-gray-400">Overall Hit Rate</div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold text-purple-400">
                {Object.values(cacheStats).reduce((acc, stat) => acc + stat.size, 0)}
              </div>
              <div className="text-sm text-gray-400">Total Cached Items</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
