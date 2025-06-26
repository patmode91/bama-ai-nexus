
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { 
  Activity, 
  Cpu, 
  HardDrive, 
  Wifi, 
  Clock,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  Zap,
  RefreshCw
} from 'lucide-react';

interface PerformanceMetric {
  timestamp: number;
  cpu: number;
  memory: number;
  network: number;
  responseTime: number;
}

interface SystemAlert {
  id: string;
  type: 'warning' | 'error' | 'info';
  message: string;
  timestamp: number;
  resolved: boolean;
}

const PerformanceMonitoringDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [alerts, setAlerts] = useState<SystemAlert[]>([
    {
      id: '1',
      type: 'warning',
      message: 'High memory usage detected (89%)',
      timestamp: Date.now() - 300000,
      resolved: false
    },
    {
      id: '2',
      type: 'error',
      message: 'API response time exceeded threshold (2.3s)',
      timestamp: Date.now() - 600000,
      resolved: false
    },
    {
      id: '3',
      type: 'info',
      message: 'Cache optimization completed successfully',
      timestamp: Date.now() - 900000,
      resolved: true
    }
  ]);
  const [isOptimizing, setIsOptimizing] = useState(false);

  useEffect(() => {
    // Generate mock performance data
    const generateMetrics = () => {
      const now = Date.now();
      const newMetrics = Array.from({ length: 20 }, (_, i) => ({
        timestamp: now - (19 - i) * 60000,
        cpu: Math.random() * 100,
        memory: Math.random() * 100,
        network: Math.random() * 100,
        responseTime: Math.random() * 2000 + 100
      }));
      setMetrics(newMetrics);
    };

    generateMetrics();
    const interval = setInterval(generateMetrics, 30000);
    return () => clearInterval(interval);
  }, []);

  const currentMetrics = metrics[metrics.length - 1] || {
    cpu: 0,
    memory: 0,
    network: 0,
    responseTime: 0
  };

  const getStatusColor = (value: number, thresholds: { warning: number; critical: number }) => {
    if (value >= thresholds.critical) return 'text-red-500';
    if (value >= thresholds.warning) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getStatusBadge = (value: number, thresholds: { warning: number; critical: number }) => {
    if (value >= thresholds.critical) return <Badge variant="destructive">Critical</Badge>;
    if (value >= thresholds.warning) return <Badge className="bg-yellow-600">Warning</Badge>;
    return <Badge className="bg-green-600">Good</Badge>;
  };

  const runOptimization = async () => {
    setIsOptimizing(true);
    // Simulate optimization process
    await new Promise(resolve => setTimeout(resolve, 3000));
    setIsOptimizing(false);
    
    // Add success alert
    const newAlert: SystemAlert = {
      id: Date.now().toString(),
      type: 'info',
      message: 'System optimization completed successfully',
      timestamp: Date.now(),
      resolved: true
    };
    setAlerts(prev => [newAlert, ...prev]);
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <div className="space-y-6">
      {/* System Overview */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Cpu className="w-5 h-5 text-blue-500" />
                <span className="text-sm text-gray-400">CPU Usage</span>
              </div>
              {getStatusBadge(currentMetrics.cpu, { warning: 70, critical: 90 })}
            </div>
            <div className="mt-2">
              <div className="flex items-center justify-between mb-1">
                <span className={`text-2xl font-bold ${getStatusColor(currentMetrics.cpu, { warning: 70, critical: 90 })}`}>
                  {Math.round(currentMetrics.cpu)}%
                </span>
              </div>
              <Progress value={currentMetrics.cpu} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <HardDrive className="w-5 h-5 text-purple-500" />
                <span className="text-sm text-gray-400">Memory</span>
              </div>
              {getStatusBadge(currentMetrics.memory, { warning: 75, critical: 90 })}
            </div>
            <div className="mt-2">
              <div className="flex items-center justify-between mb-1">
                <span className={`text-2xl font-bold ${getStatusColor(currentMetrics.memory, { warning: 75, critical: 90 })}`}>
                  {Math.round(currentMetrics.memory)}%
                </span>
              </div>
              <Progress value={currentMetrics.memory} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Wifi className="w-5 h-5 text-green-500" />
                <span className="text-sm text-gray-400">Network</span>
              </div>
              {getStatusBadge(currentMetrics.network, { warning: 80, critical: 95 })}
            </div>
            <div className="mt-2">
              <div className="flex items-center justify-between mb-1">
                <span className={`text-2xl font-bold ${getStatusColor(currentMetrics.network, { warning: 80, critical: 95 })}`}>
                  {Math.round(currentMetrics.network)}%
                </span>
              </div>
              <Progress value={currentMetrics.network} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-orange-500" />
                <span className="text-sm text-gray-400">Response Time</span>
              </div>
              {getStatusBadge(currentMetrics.responseTime / 10, { warning: 150, critical: 200 })}
            </div>
            <div className="mt-2">
              <span className={`text-2xl font-bold ${getStatusColor(currentMetrics.responseTime / 10, { warning: 150, critical: 200 })}`}>
                {Math.round(currentMetrics.responseTime)}ms
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="metrics" className="space-y-4">
        <TabsList className="bg-gray-800 border-gray-700">
          <TabsTrigger value="metrics">Performance Metrics</TabsTrigger>
          <TabsTrigger value="alerts">System Alerts</TabsTrigger>
          <TabsTrigger value="optimization">Optimization</TabsTrigger>
        </TabsList>

        <TabsContent value="metrics">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">CPU & Memory Usage</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={metrics}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis 
                      dataKey="timestamp" 
                      tickFormatter={(value) => formatTime(value)}
                      stroke="#9CA3AF" 
                    />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1F2937', 
                        border: '1px solid #374151',
                        borderRadius: '8px'
                      }}
                      labelFormatter={(value) => formatTime(value)}
                    />
                    <Line type="monotone" dataKey="cpu" stroke="#3B82F6" strokeWidth={2} name="CPU %" />
                    <Line type="monotone" dataKey="memory" stroke="#8B5CF6" strokeWidth={2} name="Memory %" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Response Time</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={metrics}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis 
                      dataKey="timestamp" 
                      tickFormatter={(value) => formatTime(value)}
                      stroke="#9CA3AF" 
                    />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1F2937', 
                        border: '1px solid #374151',
                        borderRadius: '8px'
                      }}
                      labelFormatter={(value) => formatTime(value)}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="responseTime" 
                      stroke="#F59E0B" 
                      fill="#F59E0B"
                      fillOpacity={0.3}
                      name="Response Time (ms)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
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
              <div className="space-y-3">
                {alerts.map((alert) => (
                  <div key={alert.id} className="flex items-start space-x-3 p-3 bg-gray-900 rounded-lg">
                    <div className="mt-0.5">
                      {alert.type === 'error' && <AlertTriangle className="w-5 h-5 text-red-500" />}
                      {alert.type === 'warning' && <AlertTriangle className="w-5 h-5 text-yellow-500" />}
                      {alert.type === 'info' && <CheckCircle className="w-5 h-5 text-blue-500" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-white">{alert.message}</p>
                        <div className="flex items-center space-x-2">
                          <Badge 
                            variant={alert.resolved ? 'default' : 'destructive'}
                            className={alert.resolved ? 'bg-green-600' : ''}
                          >
                            {alert.resolved ? 'Resolved' : 'Active'}
                          </Badge>
                          <span className="text-xs text-gray-400">
                            {formatTime(alert.timestamp)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="optimization">
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-500" />
                  Performance Optimization
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-300">
                  Run automated performance optimization to improve system efficiency.
                </p>
                <Button 
                  onClick={runOptimization}
                  disabled={isOptimizing}
                  className="w-full"
                >
                  {isOptimizing ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Optimizing...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 mr-2" />
                      Run Optimization
                    </>
                  )}
                </Button>
                
                <div className="space-y-3 mt-6">
                  <h4 className="font-medium text-white">Optimization Areas:</h4>
                  <div className="space-y-2 text-sm text-gray-300">
                    <div className="flex items-center justify-between">
                      <span>Memory Management</span>
                      <Badge variant="outline">Auto</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Cache Optimization</span>
                      <Badge variant="outline">Auto</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Network Efficiency</span>
                      <Badge variant="outline">Auto</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Database Queries</span>
                      <Badge variant="outline">Auto</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Performance Recommendations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="p-3 bg-blue-600/10 border border-blue-600/30 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <TrendingUp className="w-4 h-4 text-blue-500 mt-0.5" />
                      <div>
                        <h5 className="font-medium text-white text-sm">Optimize Images</h5>
                        <p className="text-xs text-gray-300 mt-1">
                          Compress and optimize images to reduce load times by 30%.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-3 bg-green-600/10 border border-green-600/30 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <TrendingUp className="w-4 h-4 text-green-500 mt-0.5" />
                      <div>
                        <h5 className="font-medium text-white text-sm">Enable Caching</h5>
                        <p className="text-xs text-gray-300 mt-1">
                          Implement browser caching to improve repeat visit performance.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-3 bg-purple-600/10 border border-purple-600/30 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <TrendingUp className="w-4 h-4 text-purple-500 mt-0.5" />
                      <div>
                        <h5 className="font-medium text-white text-sm">Lazy Loading</h5>
                        <p className="text-xs text-gray-300 mt-1">
                          Implement lazy loading for components to reduce initial bundle size.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PerformanceMonitoringDashboard;
