
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Heart, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  RefreshCw,
  TrendingUp,
  Activity,
  Zap
} from 'lucide-react';
import { systemHealthMonitor } from '@/services/systemHealthMonitor';
import { useAdvancedPerformanceMonitoring } from '@/hooks/useAdvancedPerformanceMonitoring';

const SystemHealthDashboard = () => {
  const [healthData, setHealthData] = useState<any>(null);
  const [healthChecks, setHealthChecks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { alerts, resolveAlert } = useAdvancedPerformanceMonitoring();

  const loadHealthData = async () => {
    setIsLoading(true);
    try {
      const [health, checks] = await Promise.all([
        systemHealthMonitor.getSystemHealth(),
        systemHealthMonitor.runHealthChecks()
      ]);
      
      setHealthData(health);
      setHealthChecks(checks);
    } catch (error) {
      console.error('Failed to load health data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadHealthData();
    const interval = setInterval(loadHealthData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const getHealthBadgeColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-500';
      case 'warning': return 'bg-yellow-500';
      case 'critical': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getCheckStatusIcon = (status: string) => {
    switch (status) {
      case 'pass': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warn': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'fail': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatUptime = (uptime: number) => {
    const hours = Math.floor(uptime / (1000 * 60 * 60));
    const minutes = Math.floor((uptime % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overall Health Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-500" />
            System Health Overview
            <Badge className={`${getHealthBadgeColor(healthData?.overall)} text-white ml-auto`}>
              {healthData?.overall?.toUpperCase()}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{healthData?.performance}%</div>
              <div className="text-sm text-gray-600">Performance</div>
              <Progress value={healthData?.performance} className="mt-1" />
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{healthData?.memory}%</div>
              <div className="text-sm text-gray-600">Memory</div>
              <Progress value={healthData?.memory} className="mt-1" />
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{healthData?.cache}%</div>
              <div className="text-sm text-gray-600">Cache</div>
              <Progress value={healthData?.cache} className="mt-1" />
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{healthData?.api}%</div>
              <div className="text-sm text-gray-600">API</div>
              <Progress value={healthData?.api} className="mt-1" />
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{healthData?.errors}%</div>
              <div className="text-sm text-gray-600">Error Rate</div>
              <Progress value={healthData?.errors} className="mt-1" />
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">
                {formatUptime(healthData?.uptime || 0)}
              </div>
              <div className="text-sm text-gray-600">Uptime</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="checks" className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="checks">Health Checks</TabsTrigger>
            <TabsTrigger value="alerts">Alerts ({alerts.filter(a => !a.resolved).length})</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
          </TabsList>
          
          <Button onClick={loadHealthData} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        <TabsContent value="checks">
          <div className="grid gap-4">
            {healthChecks.map((check, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getCheckStatusIcon(check.status)}
                      <div>
                        <div className="font-medium">{check.name}</div>
                        <div className="text-sm text-gray-600">{check.message}</div>
                      </div>
                    </div>
                    
                    {check.value !== undefined && (
                      <div className="text-right">
                        <div className="text-lg font-bold">
                          {typeof check.value === 'number' ? check.value.toFixed(1) : check.value}
                        </div>
                        {check.threshold && (
                          <div className="text-xs text-gray-500">
                            Target: {check.threshold}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="alerts">
          <div className="space-y-4">
            {alerts.filter(alert => !alert.resolved).length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                  <div className="text-lg font-medium">No Active Alerts</div>
                  <div className="text-gray-600">System is running smoothly</div>
                </CardContent>
              </Card>
            ) : (
              alerts
                .filter(alert => !alert.resolved)
                .map(alert => (
                  <Card key={alert.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {alert.type === 'error' && <XCircle className="w-5 h-5 text-red-500" />}
                          {alert.type === 'warning' && <AlertTriangle className="w-5 h-5 text-yellow-500" />}
                          {alert.type === 'info' && <Activity className="w-5 h-5 text-blue-500" />}
                          
                          <div>
                            <div className="font-medium">{alert.message}</div>
                            <div className="text-sm text-gray-600">
                              {new Date(alert.timestamp).toLocaleString()}
                            </div>
                          </div>
                        </div>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => resolveAlert(alert.id)}
                        >
                          Resolve
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="trends">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Performance Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Zap className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <div className="text-lg font-medium text-gray-600">Trend Analysis</div>
                <div className="text-gray-500">Historical performance data will appear here</div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SystemHealthDashboard;
