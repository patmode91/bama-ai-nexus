
import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, TrendingUp, Settings } from 'lucide-react';
import { advancedCacheService, businessCache, searchCache, aiCache } from '@/services/cache/advancedCacheService';
import { CacheMonitoringHeader } from './cache/CacheMonitoringHeader';
import { CacheOverviewTab } from './cache/CacheOverviewTab';
import { CachePerformanceTab } from './cache/CachePerformanceTab';
import { CacheSettingsTab } from './cache/CacheSettingsTab';

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

  return (
    <div className="space-y-6">
      <CacheMonitoringHeader
        refreshing={refreshing}
        onRefresh={refreshStats}
        onCleanup={performCleanup}
        onClearAll={() => clearCache('all')}
      />

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

        <TabsContent value="overview">
          <CacheOverviewTab cacheStats={cacheStats} onClearCache={clearCache} />
        </TabsContent>

        <TabsContent value="performance">
          <CachePerformanceTab cacheStats={cacheStats} />
        </TabsContent>

        <TabsContent value="settings">
          <CacheSettingsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CacheMonitoring;
