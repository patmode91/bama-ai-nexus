
import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { systemHealthService } from '@/services/monitoring/systemHealthService';
import SystemHealthHeader from './health/SystemHealthHeader';
import OverallHealthCard from './health/OverallHealthCard';
import OverviewTab from './health/OverviewTab';
import PerformanceTab from './health/PerformanceTab';
import ResourcesTab from './health/ResourcesTab';
import AlertsTab from './health/AlertsTab';

interface HealthMetric {
  id: string;
  name: string;
  value: number;
  status: 'healthy' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
  lastUpdated: number;
}

const EnhancedSystemHealth = () => {
  const [healthData, setHealthData] = useState<any>(null);
  const [metrics, setMetrics] = useState<HealthMetric[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const loadHealthData = async () => {
    setIsLoading(true);
    try {
      const currentHealth = systemHealthService.getCurrentHealth();
      const allChecks = systemHealthService.getAllHealthChecks();
      
      setHealthData(currentHealth);
      
      // Transform health checks into metrics
      const healthMetrics: HealthMetric[] = allChecks.map(check => ({
        id: check.id,
        name: check.name,
        value: check.details?.score || check.details?.memoryUsage || check.responseTime || 0,
        status: check.status as any,
        trend: 'stable', // Would be calculated from historical data
        lastUpdated: check.lastChecked
      }));
      
      setMetrics(healthMetrics);
    } catch (error) {
      console.error('Failed to load health data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadHealthData();
    
    let interval: NodeJS.Timeout;
    if (autoRefresh) {
      interval = setInterval(loadHealthData, 30000); // Refresh every 30 seconds
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  const handleAutoRefreshToggle = () => {
    setAutoRefresh(!autoRefresh);
  };

  return (
    <div className="space-y-6">
      <SystemHealthHeader
        autoRefresh={autoRefresh}
        isLoading={isLoading}
        onAutoRefreshToggle={handleAutoRefreshToggle}
        onRefresh={loadHealthData}
      />

      <OverallHealthCard healthData={healthData} metrics={metrics} />

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="bg-gray-800 border-gray-700">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <OverviewTab metrics={metrics} />
        </TabsContent>

        <TabsContent value="performance">
          <PerformanceTab metrics={metrics} />
        </TabsContent>

        <TabsContent value="resources">
          <ResourcesTab />
        </TabsContent>

        <TabsContent value="alerts">
          <AlertsTab metrics={metrics} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedSystemHealth;
