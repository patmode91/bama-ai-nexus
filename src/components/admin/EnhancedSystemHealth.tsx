
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  Zap,
  Database,
  Server,
  Users,
  Building2,
  Clock
} from 'lucide-react';
import { systemHealthService } from '@/services/monitoring/systemHealthService';

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

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-400 bg-green-400/20';
      case 'warning': return 'text-yellow-400 bg-yellow-400/20';
      case 'critical': return 'text-red-400 bg-red-400/20';
      default: return 'text-gray-400 bg-gray-400/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      case 'critical': return <XCircle className="w-4 h-4 text-red-400" />;
      default: return <Activity className="w-4 h-4 text-gray-400" />;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-3 h-3 text-green-400" />;
      case 'down': return <TrendingUp className="w-3 h-3 text-red-400 rotate-180" />;
      default: return <Activity className="w-3 h-3 text-gray-400" />;
    }
  };

  const overallHealthScore = healthData?.score || 0;

  return (
    <div className="space-y-6">
      {/* Header with controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">System Health Monitor</h2>
          <p className="text-gray-400">Real-time system performance and health metrics</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={autoRefresh ? 'border-green-500 text-green-400' : 'border-gray-600'}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
            Auto Refresh: {autoRefresh ? 'ON' : 'OFF'}
          </Button>
          <Button onClick={loadHealthData} disabled={isLoading} size="sm">
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh Now
          </Button>
        </div>
      </div>

      {/* Overall Health Status */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Heart className="w-5 h-5 text-red-400" />
            Overall System Health
            <Badge className={getHealthColor(healthData?.overall || 'unknown')}>
              {(healthData?.overall || 'unknown').toUpperCase()}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">{overallHealthScore}</div>
              <div className="text-sm text-gray-400 mb-2">Health Score</div>
              <Progress value={overallHealthScore} className="h-2" />
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400 mb-2">
                {metrics.filter(m => m.status === 'healthy').length}
              </div>
              <div className="text-sm text-gray-400">Healthy Services</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400 mb-2">
                {metrics.filter(m => m.status === 'warning').length}
              </div>
              <div className="text-sm text-gray-400">Warnings</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-400 mb-2">
                {metrics.filter(m => m.status === 'critical').length}
              </div>
              <div className="text-sm text-gray-400">Critical Issues</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="bg-gray-800 border-gray-700">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {metrics.map((metric) => (
              <Card key={metric.id} className="bg-gray-800 border-gray-700">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(metric.status)}
                      <span className="font-medium text-white">{metric.name}</span>
                    </div>
                    {getTrendIcon(metric.trend)}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold text-white">
                      {typeof metric.value === 'number' ? metric.value.toFixed(1) : metric.value}
                    </div>
                    <Badge className={getHealthColor(metric.status)} size="sm">
                      {metric.status}
                    </Badge>
                  </div>
                  <div className="text-xs text-gray-400 mt-2">
                    Updated: {new Date(metric.lastUpdated).toLocaleTimeString()}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="performance">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">Response Times</h3>
                  {metrics.filter(m => m.id.includes('response') || m.id.includes('api')).map(metric => (
                    <div key={metric.id} className="flex items-center justify-between">
                      <span className="text-gray-300">{metric.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-white font-medium">{metric.value.toFixed(0)}ms</span>
                        {getStatusIcon(metric.status)}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">System Resources</h3>
                  {metrics.filter(m => m.id.includes('memory') || m.id.includes('cpu')).map(metric => (
                    <div key={metric.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300">{metric.name}</span>
                        <span className="text-white font-medium">{metric.value.toFixed(1)}%</span>
                      </div>
                      <Progress value={metric.value} className="h-2" />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resources">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Database className="w-5 h-5 text-blue-400" />
                  <span className="font-medium text-white">Database</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Connections:</span>
                    <span className="text-white">8/100</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Query Time:</span>
                    <span className="text-white">45ms</span>
                  </div>
                  <Badge className="text-green-400 bg-green-400/20">Healthy</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Server className="w-5 h-5 text-purple-400" />
                  <span className="font-medium text-white">Server</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">CPU Usage:</span>
                    <span className="text-white">23%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Memory:</span>
                    <span className="text-white">1.2GB</span>
                  </div>
                  <Badge className="text-green-400 bg-green-400/20">Optimal</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Users className="w-5 h-5 text-green-400" />
                  <span className="font-medium text-white">Active Users</span>
                </div>
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-white">127</div>
                  <div className="text-xs text-gray-400">Online now</div>
                  <Badge className="text-blue-400 bg-blue-400/20">Normal</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center gap-3 mb-3">
                  <Building2 className="w-5 h-5 text-orange-400" />
                  <span className="font-medium text-white">Data Quality</span>
                </div>
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-white">94%</div>
                  <div className="text-xs text-gray-400">Completeness</div>
                  <Badge className="text-green-400 bg-green-400/20">Excellent</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="alerts">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">System Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {metrics.filter(m => m.status !== 'healthy').length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
                    <div className="text-lg font-medium text-white">All Systems Operational</div>
                    <div className="text-gray-400">No active alerts or issues detected</div>
                  </div>
                ) : (
                  metrics
                    .filter(m => m.status !== 'healthy')
                    .map(metric => (
                      <div key={metric.id} className="flex items-center gap-4 p-4 bg-gray-700 rounded-lg">
                        {getStatusIcon(metric.status)}
                        <div className="flex-1">
                          <div className="font-medium text-white">{metric.name}</div>
                          <div className="text-sm text-gray-400">
                            Current value: {metric.value} - Status: {metric.status}
                          </div>
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(metric.lastUpdated).toLocaleString()}
                        </div>
                      </div>
                    ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedSystemHealth;
