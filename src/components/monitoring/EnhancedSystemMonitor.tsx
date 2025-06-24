
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useRealtime } from '@/hooks/useRealtime';
import { 
  Server, 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Clock,
  Database,
  Globe,
  Cpu,
  HardDrive,
  Memory,
  Network,
  Zap,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

interface SystemMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  status: 'healthy' | 'warning' | 'critical';
  threshold: number;
  trend: number[];
}

interface SystemAlert {
  id: string;
  type: 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: number;
  resolved: boolean;
  component: string;
}

interface PerformanceData {
  timestamp: number;
  cpu: number;
  memory: number;
  network: number;
  database: number;
}

const EnhancedSystemMonitor: React.FC = () => {
  const [metrics, setMetrics] = useState<SystemMetric[]>([
    {
      id: 'cpu',
      name: 'CPU Usage',
      value: 45.2,
      unit: '%',
      status: 'healthy',
      threshold: 80,
      trend: [42, 43, 45, 44, 45, 47, 45]
    },
    {
      id: 'memory',
      name: 'Memory Usage',
      value: 68.7,
      unit: '%',
      status: 'warning',
      threshold: 85,
      trend: [65, 66, 68, 67, 69, 68, 69]
    },
    {
      id: 'disk',
      name: 'Disk I/O',
      value: 23.1,
      unit: 'MB/s',
      status: 'healthy',
      threshold: 100,
      trend: [20, 22, 21, 23, 24, 22, 23]
    },
    {
      id: 'network',
      name: 'Network',
      value: 156.8,
      unit: 'Mbps',
      status: 'healthy',
      threshold: 500,
      trend: [150, 152, 155, 154, 157, 156, 157]
    }
  ]);

  const [alerts, setAlerts] = useState<SystemAlert[]>([
    {
      id: '1',
      type: 'warning',
      title: 'High Memory Usage',
      message: 'Memory usage has exceeded 65% for the past 10 minutes',
      timestamp: Date.now() - 600000,
      resolved: false,
      component: 'Application Server'
    },
    {
      id: '2',
      type: 'info',
      title: 'Database Backup Completed',
      message: 'Scheduled backup completed successfully',
      timestamp: Date.now() - 1800000,
      resolved: true,
      component: 'Database'
    },
    {
      id: '3',
      type: 'error',
      title: 'API Rate Limit Exceeded',
      message: 'External API rate limit reached for geocoding service',
      timestamp: Date.now() - 3600000,
      resolved: true,
      component: 'External APIs'
    }
  ]);

  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([
    { timestamp: Date.now() - 3600000, cpu: 42, memory: 65, network: 150, database: 95 },
    { timestamp: Date.now() - 2700000, cpu: 43, memory: 66, network: 152, database: 98 },
    { timestamp: Date.now() - 1800000, cpu: 45, memory: 68, network: 155, database: 92 },
    { timestamp: Date.now() - 900000, cpu: 44, memory: 67, network: 154, database: 96 },
    { timestamp: Date.now(), cpu: 45, memory: 69, network: 157, database: 94 }
  ]);

  const [systemStatus, setSystemStatus] = useState<'operational' | 'degraded' | 'outage'>('operational');

  const { events } = useRealtime({
    channel: 'system-monitoring',
    eventTypes: ['system_alert', 'user_activity']
  });

  useEffect(() => {
    // Simulate real-time metric updates
    const interval = setInterval(() => {
      setMetrics(prev => prev.map(metric => {
        const newValue = metric.value + (Math.random() - 0.5) * 5;
        const clampedValue = Math.max(0, Math.min(100, newValue));
        const newTrend = [...metric.trend.slice(-6), clampedValue];
        
        let status: 'healthy' | 'warning' | 'critical' = 'healthy';
        if (clampedValue > metric.threshold * 0.9) status = 'critical';
        else if (clampedValue > metric.threshold * 0.7) status = 'warning';

        return {
          ...metric,
          value: clampedValue,
          status,
          trend: newTrend
        };
      }));

      setPerformanceData(prev => {
        const newData: PerformanceData = {
          timestamp: Date.now(),
          cpu: 40 + Math.random() * 20,
          memory: 60 + Math.random() * 20,
          network: 140 + Math.random() * 30,
          database: 85 + Math.random() * 20
        };
        return [...prev.slice(-9), newData];
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'critical': return <XCircle className="w-5 h-5 text-red-500" />;
      default: return <Activity className="w-5 h-5 text-gray-500" />;
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'error': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'info': return <CheckCircle className="w-4 h-4 text-blue-500" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const criticalAlerts = alerts.filter(alert => alert.type === 'error' && !alert.resolved).length;
  const warningAlerts = alerts.filter(alert => alert.type === 'warning' && !alert.resolved).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white flex items-center space-x-3">
            <Server className="w-8 h-8" />
            <span>System Monitor</span>
          </h2>
          <p className="text-gray-400">Real-time system health and performance monitoring</p>
        </div>
        <div className="flex items-center space-x-4">
          <Badge 
            variant={systemStatus === 'operational' ? 'default' : 'destructive'}
            className={`flex items-center space-x-1 ${
              systemStatus === 'operational' ? 'bg-green-600' : 'bg-red-600'
            }`}
          >
            {systemStatus === 'operational' ? 
              <CheckCircle className="w-3 h-3" /> : 
              <XCircle className="w-3 h-3" />
            }
            <span className="capitalize">{systemStatus}</span>
          </Badge>
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        </div>
      </div>

      {/* System Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <Card key={metric.id} className="bg-gray-900/80 backdrop-blur-sm border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">
                {metric.name}
              </CardTitle>
              {getStatusIcon(metric.status)}
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-2xl font-bold text-white">
                  {metric.value.toFixed(1)}{metric.unit}
                </div>
                <Progress 
                  value={(metric.value / metric.threshold) * 100} 
                  className="h-2"
                />
                <p className="text-xs text-gray-400">
                  Threshold: {metric.threshold}{metric.unit}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Alerts Summary */}
      {(criticalAlerts > 0 || warningAlerts > 0) && (
        <Card className="bg-red-900/20 border-red-500/30">
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              <AlertTriangle className="w-6 h-6 text-red-500" />
              <div>
                <h3 className="text-lg font-semibold text-white">Active Alerts</h3>
                <p className="text-gray-300">
                  {criticalAlerts > 0 && `${criticalAlerts} critical`}
                  {criticalAlerts > 0 && warningAlerts > 0 && ', '}
                  {warningAlerts > 0 && `${warningAlerts} warnings`}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="bg-gray-800 border-gray-700">
          <TabsTrigger value="overview" className="flex items-center space-x-2">
            <Activity className="w-4 h-4" />
            <span>Overview</span>
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4" />
            <span>Performance</span>
          </TabsTrigger>
          <TabsTrigger value="alerts" className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4" />
            <span>Alerts ({alerts.filter(a => !a.resolved).length})</span>
          </TabsTrigger>
          <TabsTrigger value="services" className="flex items-center space-x-2">
            <Server className="w-4 h-4" />
            <span>Services</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-gray-900/80 backdrop-blur-sm border-gray-700">
              <CardHeader>
                <CardTitle>System Performance Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis 
                      dataKey="timestamp" 
                      tickFormatter={formatTime}
                      stroke="#9CA3AF"
                    />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip 
                      labelFormatter={(value) => formatTime(value as number)}
                      contentStyle={{ 
                        backgroundColor: '#1F2937', 
                        border: '1px solid #374151',
                        borderRadius: '8px'
                      }}
                    />
                    <Line type="monotone" dataKey="cpu" stroke="#3B82F6" strokeWidth={2} name="CPU %" />
                    <Line type="monotone" dataKey="memory" stroke="#10B981" strokeWidth={2} name="Memory %" />
                    <Line type="monotone" dataKey="network" stroke="#F59E0B" strokeWidth={2} name="Network" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/80 backdrop-blur-sm border-gray-700">
              <CardHeader>
                <CardTitle>Resource Utilization</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {metrics.map((metric) => (
                  <div key={metric.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-300">{metric.name}</span>
                      <span className="text-sm text-white">{metric.value.toFixed(1)}{metric.unit}</span>
                    </div>
                    <Progress 
                      value={(metric.value / metric.threshold) * 100}
                      className="h-2"
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card className="bg-gray-900/80 backdrop-blur-sm border-gray-700">
            <CardHeader>
              <CardTitle>Detailed Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="timestamp" 
                    tickFormatter={formatTime}
                    stroke="#9CA3AF"
                  />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip 
                    labelFormatter={(value) => formatTime(value as number)}
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px'
                    }}
                  />
                  <Area type="monotone" dataKey="cpu" stackId="1" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} />
                  <Area type="monotone" dataKey="memory" stackId="1" stroke="#10B981" fill="#10B981" fillOpacity={0.6} />
                  <Area type="monotone" dataKey="database" stackId="1" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.6} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <ScrollArea className="h-[600px]">
            <div className="space-y-4">
              {alerts.map((alert) => (
                <Card 
                  key={alert.id} 
                  className={`bg-gray-900/80 backdrop-blur-sm border-gray-700 ${
                    !alert.resolved ? 'border-l-4 border-l-red-500' : ''
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      {getAlertIcon(alert.type)}
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-semibold text-white">{alert.title}</h3>
                          {alert.resolved ? (
                            <Badge variant="outline" className="text-green-400 border-green-400">
                              Resolved
                            </Badge>
                          ) : (
                            <Badge variant="destructive">Active</Badge>
                          )}
                        </div>
                        <p className="text-gray-300 text-sm mb-2">{alert.message}</p>
                        <div className="flex items-center space-x-4 text-xs text-gray-400">
                          <span>{alert.component}</span>
                          <span>{new Date(alert.timestamp).toLocaleString()}</span>
                        </div>
                      </div>
                      {!alert.resolved && (
                        <Button size="sm" variant="outline">
                          Resolve
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="services" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { name: 'Web Server', status: 'healthy', uptime: '99.9%', icon: Globe },
              { name: 'Database', status: 'healthy', uptime: '100%', icon: Database },
              { name: 'Cache', status: 'warning', uptime: '98.5%', icon: Memory },
              { name: 'Background Jobs', status: 'healthy', uptime: '99.7%', icon: Zap },
              { name: 'File Storage', status: 'healthy', uptime: '99.8%', icon: HardDrive },
              { name: 'Load Balancer', status: 'healthy', uptime: '100%', icon: Network }
            ].map((service) => (
              <Card key={service.name} className="bg-gray-900/80 backdrop-blur-sm border-gray-700">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <service.icon className="w-6 h-6 text-blue-400" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-white">{service.name}</h3>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(service.status)}
                        <span className="text-sm text-gray-400">Uptime: {service.uptime}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedSystemMonitor;
