
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Server, 
  Database, 
  Globe, 
  Shield, 
  Activity,
  CheckCircle,
  AlertCircle,
  XCircle,
  Clock,
  TrendingUp
} from 'lucide-react';

interface HealthCheck {
  id: string;
  name: string;
  status: 'healthy' | 'warning' | 'critical' | 'offline';
  responseTime: number;
  uptime: number;
  lastCheck: number;
  details?: string;
}

interface SystemMetric {
  name: string;
  value: number;
  unit: string;
  status: 'good' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
}

const SystemHealthMonitor: React.FC = () => {
  const [healthChecks, setHealthChecks] = useState<HealthCheck[]>([
    {
      id: '1',
      name: 'Web Server',
      status: 'healthy',
      responseTime: 45,
      uptime: 99.8,
      lastCheck: Date.now() - 30000,
      details: 'All services operational'
    },
    {
      id: '2',
      name: 'Database',
      status: 'healthy',
      responseTime: 12,
      uptime: 99.9,
      lastCheck: Date.now() - 15000,
      details: 'Connection pool stable'
    },
    {
      id: '3',
      name: 'API Gateway',
      status: 'warning',
      responseTime: 180,
      uptime: 98.5,
      lastCheck: Date.now() - 45000,
      details: 'Elevated response times'
    },
    {
      id: '4',
      name: 'CDN',
      status: 'healthy',
      responseTime: 23,
      uptime: 99.95,
      lastCheck: Date.now() - 20000,
      details: 'Global distribution active'
    },
    {
      id: '5',
      name: 'Security Services',
      status: 'healthy',
      responseTime: 8,
      uptime: 100,
      lastCheck: Date.now() - 10000,
      details: 'All security checks passed'
    }
  ]);

  const [systemMetrics, setSystemMetrics] = useState<SystemMetric[]>([
    { name: 'CPU Usage', value: 45, unit: '%', status: 'good', trend: 'stable' },
    { name: 'Memory Usage', value: 67, unit: '%', status: 'warning', trend: 'up' },
    { name: 'Disk Usage', value: 34, unit: '%', status: 'good', trend: 'stable' },
    { name: 'Network I/O', value: 89, unit: 'Mbps', status: 'good', trend: 'up' },
    { name: 'Active Sessions', value: 1247, unit: '', status: 'good', trend: 'up' },
    { name: 'Queue Size', value: 23, unit: 'jobs', status: 'good', trend: 'down' }
  ]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning': return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'critical': return <XCircle className="w-5 h-5 text-red-500" />;
      case 'offline': return <XCircle className="w-5 h-5 text-gray-500" />;
      default: return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': case 'good': return 'bg-green-600';
      case 'warning': return 'bg-yellow-600';
      case 'critical': return 'bg-red-600';
      case 'offline': return 'bg-gray-600';
      default: return 'bg-gray-600';
    }
  };

  const getServiceIcon = (serviceName: string) => {
    switch (serviceName.toLowerCase()) {
      case 'web server': return <Server className="w-5 h-5" />;
      case 'database': return <Database className="w-5 h-5" />;
      case 'api gateway': return <Globe className="w-5 h-5" />;
      case 'cdn': return <Globe className="w-5 h-5" />;
      case 'security services': return <Shield className="w-5 h-5" />;
      default: return <Activity className="w-5 h-5" />;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-3 h-3 text-green-500" />;
      case 'down': return <TrendingUp className="w-3 h-3 text-red-500 rotate-180" />;
      default: return <div className="w-3 h-3 bg-gray-500 rounded-full" />;
    }
  };

  const formatTimestamp = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    return `${Math.floor(minutes / 60)}h ago`;
  };

  const overallHealth = healthChecks.filter(check => check.status === 'healthy').length / healthChecks.length * 100;

  return (
    <div className="space-y-6">
      {/* Overall Health Status */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Activity className="w-6 h-6 text-green-500" />
            System Health Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">
                {Math.round(overallHealth)}%
              </div>
              <div className="text-sm text-gray-400">Overall Health</div>
              <Progress value={overallHealth} className="mt-2" />
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-500 mb-2">
                {healthChecks.filter(c => c.status === 'healthy').length}
              </div>
              <div className="text-sm text-gray-400">Healthy Services</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-500 mb-2">
                {healthChecks.filter(c => c.status === 'warning').length}
              </div>
              <div className="text-sm text-gray-400">Warnings</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Service Health Checks */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Service Health Checks</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96">
              <div className="space-y-3">
                {healthChecks.map((check) => (
                  <div key={check.id} className="p-3 bg-gray-900 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        {getServiceIcon(check.name)}
                        <div>
                          <h4 className="font-medium text-white">{check.name}</h4>
                          <p className="text-xs text-gray-400">{check.details}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(check.status)}
                        <Badge className={getStatusColor(check.status)}>
                          {check.status}
                        </Badge>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-400">Response</span>
                        <div className="font-medium text-white">{check.responseTime}ms</div>
                      </div>
                      <div>
                        <span className="text-gray-400">Uptime</span>
                        <div className="font-medium text-white">{check.uptime}%</div>
                      </div>
                      <div>
                        <span className="text-gray-400">Last Check</span>
                        <div className="font-medium text-white">{formatTimestamp(check.lastCheck)}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* System Metrics */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">System Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96">
              <div className="space-y-4">
                {systemMetrics.map((metric, index) => (
                  <div key={index} className="p-3 bg-gray-900 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-white">{metric.name}</span>
                        {getTrendIcon(metric.trend)}
                      </div>
                      <Badge className={getStatusColor(metric.status)}>
                        {metric.status}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-white">
                        {metric.value}{metric.unit}
                      </span>
                      {metric.name.includes('Usage') && (
                        <Progress value={metric.value} className="w-24 h-2" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">System Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="p-4 bg-gray-900 rounded-lg text-center">
              <Server className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <h4 className="font-medium text-white mb-1">Restart Services</h4>
              <p className="text-xs text-gray-400">Restart all system services</p>
            </div>
            <div className="p-4 bg-gray-900 rounded-lg text-center">
              <Database className="w-8 h-8 text-purple-500 mx-auto mb-2" />
              <h4 className="font-medium text-white mb-1">Clear Cache</h4>
              <p className="text-xs text-gray-400">Clear system cache</p>
            </div>
            <div className="p-4 bg-gray-900 rounded-lg text-center">
              <Activity className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <h4 className="font-medium text-white mb-1">Run Diagnostics</h4>
              <p className="text-xs text-gray-400">Full system diagnostic</p>
            </div>
            <div className="p-4 bg-gray-900 rounded-lg text-center">
              <Shield className="w-8 h-8 text-orange-500 mx-auto mb-2" />
              <h4 className="font-medium text-white mb-1">Security Scan</h4>
              <p className="text-xs text-gray-400">Run security audit</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemHealthMonitor;
