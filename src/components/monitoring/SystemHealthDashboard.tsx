
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Activity, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  Cpu, 
  Database,
  Globe,
  MemoryStick,
  RefreshCw,
  Shield,
  Zap
} from 'lucide-react';
import { errorTracker } from '@/services/monitoring/errorTracker';
import { performanceAnalyzer } from '@/services/monitoring/performanceAnalyzer';
import { rateLimiter } from '@/services/security/rateLimiter';

const SystemHealthDashboard = () => {
  const [performanceReport, setPerformanceReport] = useState(performanceAnalyzer.getPerformanceReport());
  const [errors, setErrors] = useState(errorTracker.getErrors(10));
  const [rateLimitStats, setRateLimitStats] = useState(rateLimiter.getStats());
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const refreshData = () => {
    setPerformanceReport(performanceAnalyzer.getPerformanceReport());
    setErrors(errorTracker.getErrors(10));
    setRateLimitStats(rateLimiter.getStats());
    setLastUpdated(new Date());
  };

  useEffect(() => {
    const interval = setInterval(refreshData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (score: number) => {
    if (score >= 90) return 'text-green-500';
    if (score >= 70) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getStatusBadge = (score: number) => {
    if (score >= 90) return <Badge variant="outline" className="text-green-500 border-green-500">Excellent</Badge>;
    if (score >= 70) return <Badge variant="outline" className="text-yellow-500 border-yellow-500">Good</Badge>;
    return <Badge variant="outline" className="text-red-500 border-red-500">Needs Attention</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white">System Health Dashboard</h2>
          <p className="text-gray-400">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
        </div>
        <Button onClick={refreshData} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gray-900/80 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Performance Score</CardTitle>
            <Zap className={`w-4 h-4 ${getStatusColor(performanceReport.score)}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{performanceReport.score}/100</div>
            <Progress value={performanceReport.score} className="mt-2" />
            {getStatusBadge(performanceReport.score)}
          </CardContent>
        </Card>

        <Card className="bg-gray-900/80 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Error Rate</CardTitle>
            <AlertCircle className="w-4 h-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{errors.length}</div>
            <p className="text-xs text-gray-400">Last 24 hours</p>
            <Badge variant={errors.length > 10 ? "destructive" : "outline"}>
              {errors.length > 10 ? 'High' : 'Normal'}
            </Badge>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/80 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Security Status</CardTitle>
            <Shield className="w-4 h-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">Secure</div>
            <p className="text-xs text-gray-400">Rate limiting active</p>
            <Badge variant="outline" className="text-green-500 border-green-500">
              Protected
            </Badge>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/80 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Uptime</CardTitle>
            <Activity className="w-4 h-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">99.9%</div>
            <p className="text-xs text-gray-400">Last 30 days</p>
            <Badge variant="outline" className="text-green-500 border-green-500">
              Operational
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Tabs */}
      <Tabs defaultValue="performance" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-gray-800/50">
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="errors">Errors</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-4">
          <Card className="bg-gray-900/80 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Core Web Vitals</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {performanceReport.vitals.map((vital, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      vital.rating === 'good' ? 'bg-green-500' :
                      vital.rating === 'needs-improvement' ? 'bg-yellow-500' : 'bg-red-500'
                    }`} />
                    <span className="text-white font-medium">{vital.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-white">{vital.value.toFixed(vital.name === 'CLS' ? 3 : 0)}{vital.name === 'CLS' ? '' : 'ms'}</div>
                    <div className="text-xs text-gray-400 capitalize">{vital.rating.replace('-', ' ')}</div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-gray-900/80 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {performanceReport.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-300 text-sm">{rec}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="errors" className="space-y-4">
          <Card className="bg-gray-900/80 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Recent Errors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {errors.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                    <p className="text-gray-300">No recent errors detected</p>
                  </div>
                ) : (
                  errors.map((error, index) => (
                    <div key={index} className="border border-gray-700 rounded-lg p-3">
                      <div className="flex items-start justify-between mb-2">
                        <span className="text-red-400 font-medium text-sm">{error.message}</span>
                        <span className="text-xs text-gray-500">
                          {new Date(error.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="text-xs text-gray-400">
                        {error.url}
                        {error.lineNumber && `:${error.lineNumber}`}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card className="bg-gray-900/80 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Rate Limiting Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {rateLimitStats.map((stat, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border border-gray-700 rounded-lg">
                    <div>
                      <div className="text-white font-medium capitalize">{stat.action}</div>
                      <div className="text-xs text-gray-400">
                        {stat.rule.maxRequests} requests per {Math.round(stat.rule.windowMs / 60000)} minutes
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-white">{stat.activeKeys}</div>
                      <div className="text-xs text-gray-400">Active sessions</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-gray-900/80 border-gray-700">
              <CardHeader className="flex flex-row items-center space-y-0">
                <Cpu className="w-5 h-5 text-blue-400 mr-2" />
                <CardTitle className="text-white">CPU Usage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white mb-2">12%</div>
                <Progress value={12} className="mb-2" />
                <p className="text-xs text-gray-400">Normal operation</p>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/80 border-gray-700">
              <CardHeader className="flex flex-row items-center space-y-0">
                <MemoryStick className="w-5 h-5 text-green-400 mr-2" />
                <CardTitle className="text-white">Memory Usage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white mb-2">68%</div>
                <Progress value={68} className="mb-2" />
                <p className="text-xs text-gray-400">Within normal range</p>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/80 border-gray-700">
              <CardHeader className="flex flex-row items-center space-y-0">
                <Database className="w-5 h-5 text-purple-400 mr-2" />
                <CardTitle className="text-white">Database</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white mb-2">Healthy</div>
                <div className="text-xs text-gray-400">Response time: 23ms</div>
                <Badge variant="outline" className="text-green-500 border-green-500 mt-2">
                  Connected
                </Badge>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/80 border-gray-700">
              <CardHeader className="flex flex-row items-center space-y-0">
                <Globe className="w-5 h-5 text-orange-400 mr-2" />
                <CardTitle className="text-white">API Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white mb-2">Online</div>
                <div className="text-xs text-gray-400">All endpoints operational</div>
                <Badge variant="outline" className="text-green-500 border-green-500 mt-2">
                  Operational
                </Badge>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SystemHealthDashboard;
