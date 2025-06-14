
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Database, 
  TrendingUp, 
  RefreshCw, 
  Trash2, 
  Activity,
  Zap,
  Clock,
  BarChart3,
  Settings,
  AlertTriangle
} from 'lucide-react';
import { advancedCacheService, businessCache, searchCache, aiCache } from '@/services/advancedCacheService';

const CacheMonitoring = () => {
  const [cacheStats, setCacheStats] = useState({
    main: advancedCacheService.getStats(),
    business: businessCache.getStats(),
    search: searchCache.getStats(),
    ai: aiCache.getStats()
  });
  
  const [refreshing, setRefreshing] = useState(false);

  const refreshStats = async () => {
    setRefreshing(true);
    try {
      // Simulate some delay for loading effect
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setCacheStats({
        main: advancedCacheService.getStats(),
        business: businessCache.getStats(),
        search: searchCache.getStats(),
        ai: aiCache.getStats()
      });
    } finally {
      setRefreshing(false);
    }
  };

  const clearCache = async (cacheType: string) => {
    switch (cacheType) {
      case 'main':
        advancedCacheService.clear();
        break;
      case 'business':
        businessCache.clear();
        break;
      case 'search':
        searchCache.clear();
        break;
      case 'ai':
        aiCache.clear();
        break;
      case 'all':
        advancedCacheService.clear();
        businessCache.clear();
        searchCache.clear();
        aiCache.clear();
        break;
    }
    await refreshStats();
  };

  const performCleanup = async () => {
    advancedCacheService.cleanup();
    businessCache.cleanup();
    searchCache.cleanup();
    aiCache.cleanup();
    await refreshStats();
  };

  useEffect(() => {
    // Auto-refresh stats every 30 seconds
    const interval = setInterval(refreshStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const getHitRateColor = (hitRate: number) => {
    if (hitRate >= 80) return 'text-green-500';
    if (hitRate >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getHitRateBadge = (hitRate: number) => {
    if (hitRate >= 80) return 'bg-green-500';
    if (hitRate >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const CacheStatsCard = ({ title, stats, cacheType, icon: Icon }: any) => (
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
            onClick={() => clearCache(cacheType)}
            className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            <Trash2 className="w-3 h-3 mr-1" />
            Clear
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-gray-800 to-gray-700 border-gray-600">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-white">
            <div className="flex items-center">
              <Database className="w-6 h-6 mr-2 text-[#00C2FF]" />
              Advanced Cache Monitoring
              <Badge className="ml-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                Multi-Layer
              </Badge>
            </div>
            <div className="flex space-x-2">
              <Button
                onClick={performCleanup}
                variant="outline"
                size="sm"
                className="border-gray-600 text-gray-300"
              >
                <Activity className="w-4 h-4 mr-1" />
                Cleanup
              </Button>
              <Button
                onClick={refreshStats}
                disabled={refreshing}
                variant="outline"
                size="sm"
                className="border-gray-600 text-gray-300"
              >
                <RefreshCw className={`w-4 h-4 mr-1 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button
                onClick={() => clearCache('all')}
                variant="destructive"
                size="sm"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Clear All
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-gray-800 w-full">
          <TabsTrigger value="overview" className="flex-1">
            <BarChart3 className="w-4 h-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex-1">
            <TrendingUp className="w-4 h-4 mr-2" />
            Performance
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex-1">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Cache Statistics Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <CacheStatsCard
              title="Main Cache"
              stats={cacheStats.main}
              cacheType="main"
              icon={Database}
            />
            <CacheStatsCard
              title="Business Cache"
              stats={cacheStats.business}
              cacheType="business"
              icon={Activity}
            />
            <CacheStatsCard
              title="Search Cache"
              stats={cacheStats.search}
              cacheType="search"
              icon={TrendingUp}
            />
            <CacheStatsCard
              title="AI Cache"
              stats={cacheStats.ai}
              cacheType="ai"
              icon={Zap}
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
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
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
                  {Object.entries(cacheStats).map(([key, stats]) => {
                    const alerts = [];
                    if (stats.hitRate < 50) {
                      alerts.push(`${key} cache hit rate is low (${stats.hitRate.toFixed(1)}%)`);
                    }
                    if (stats.size > 800) {
                      alerts.push(`${key} cache is approaching capacity (${stats.size}/1000)`);
                    }
                    if (stats.evictions > 50) {
                      alerts.push(`${key} cache has high eviction rate (${stats.evictions})`);
                    }
                    
                    return alerts.map((alert, index) => (
                      <div key={`${key}-${index}`} className="flex items-center space-x-2 text-yellow-400">
                        <AlertTriangle className="w-4 h-4" />
                        <span className="text-sm">{alert}</span>
                      </div>
                    ));
                  })}
                  {Object.values(cacheStats).every(stats => 
                    stats.hitRate >= 50 && stats.size <= 800 && stats.evictions <= 50
                  ) && (
                    <div className="flex items-center space-x-2 text-green-400">
                      <Zap className="w-4 h-4" />
                      <span className="text-sm">All caches performing optimally</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Cache Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm text-gray-300">Auto-cleanup Interval</label>
                    <div className="text-white">60 seconds</div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-gray-300">Compression</label>
                    <Badge className="bg-green-500 text-white">Enabled</Badge>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-gray-300">Analytics</label>
                    <Badge className="bg-green-500 text-white">Enabled</Badge>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-gray-300">Eviction Policy</label>
                    <div className="text-white">LRU (Least Recently Used)</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CacheMonitoring;
