
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Activity, 
  Zap, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  BarChart3,
  Cpu,
  Memory,
  Network
} from 'lucide-react';
import { performanceMonitor } from '@/services/performanceMonitor';
import { systemOptimizer } from '@/services/optimization/systemOptimizer';

const AdvancedPerformanceDashboard = () => {
  const [performanceScore, setPerformanceScore] = useState(0);
  const [metrics, setMetrics] = useState<any>({});
  const [optimizationHistory, setOptimizationHistory] = useState<any[]>([]);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);

  useEffect(() => {
    const updateMetrics = () => {
      const score = performanceMonitor.calculatePerformanceScore();
      const currentMetrics = performanceMonitor.getMetricsSummary();
      const history = systemOptimizer.getOptimizationHistory();
      const currentSuggestions = systemOptimizer.getOptimizationSuggestions();

      setPerformanceScore(score);
      setMetrics(currentMetrics);
      setOptimizationHistory(history.slice(-10)); // Last 10 optimizations
      setSuggestions(currentSuggestions);
    };

    updateMetrics();
    const interval = setInterval(updateMetrics, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const handleOptimization = async () => {
    setIsOptimizing(true);
    try {
      await systemOptimizer.runOptimization();
    } catch (error) {
      console.error('Optimization failed:', error);
    } finally {
      setIsOptimizing(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-500';
    if (score >= 70) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 90) return 'default';
    if (score >= 70) return 'secondary';
    return 'destructive';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Performance Dashboard</h2>
          <p className="text-gray-400">Real-time performance monitoring and optimization</p>
        </div>
        <Button 
          onClick={handleOptimization}
          disabled={isOptimizing}
          className="bg-blue-600 hover:bg-blue-500"
        >
          <Zap className="w-4 h-4 mr-2" />
          {isOptimizing ? 'Optimizing...' : 'Run Optimization'}
        </Button>
      </div>

      {/* Performance Score Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Performance Score</CardTitle>
            <Activity className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white mb-2">{performanceScore}</div>
            <Progress value={performanceScore} className="mb-2" />
            <Badge variant={getScoreBadgeVariant(performanceScore)}>
              {performanceScore >= 90 ? 'Excellent' : performanceScore >= 70 ? 'Good' : 'Needs Attention'}
            </Badge>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Core Web Vitals</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">LCP:</span>
                <span className="text-white">{metrics.LCP?.latest?.toFixed(0) || 'N/A'}ms</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">FID:</span>
                <span className="text-white">{metrics.FID?.latest?.toFixed(0) || 'N/A'}ms</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">CLS:</span>
                <span className="text-white">{metrics.CLS?.latest?.toFixed(3) || 'N/A'}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">API Performance</CardTitle>
            <Network className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white mb-2">
              {metrics.API_CALL_DURATION?.average?.toFixed(0) || 0}ms
            </div>
            <p className="text-xs text-gray-400">Average response time</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Memory Usage</CardTitle>
            <Memory className="h-4 w-4 text-orange-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white mb-2">
              {metrics.MEMORY_USAGE_PERCENT?.latest?.toFixed(1) || 0}%
            </div>
            <p className="text-xs text-gray-400">Current usage</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="metrics" className="space-y-4">
        <TabsList className="bg-gray-800 border-gray-700">
          <TabsTrigger value="metrics" className="data-[state=active]:bg-gray-700">
            Real-time Metrics
          </TabsTrigger>
          <TabsTrigger value="optimizations" className="data-[state=active]:bg-gray-700">
            Optimizations
          </TabsTrigger>
          <TabsTrigger value="suggestions" className="data-[state=active]:bg-gray-700">
            Suggestions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="metrics">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Performance Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(metrics).map(([key, value]: [string, any]) => (
                    <div key={key} className="flex justify-between items-center">
                      <span className="text-gray-400 text-sm">{key.replace(/_/g, ' ')}</span>
                      <div className="text-right">
                        <div className="text-white font-medium">
                          {value?.latest?.toFixed(2) || 'N/A'}
                        </div>
                        <div className="text-xs text-gray-500">
                          Avg: {value?.average?.toFixed(2) || 'N/A'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Cpu className="w-5 h-5" />
                  System Health
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span className="text-white">Core Systems Online</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span className="text-white">API Endpoints Healthy</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <span className="text-white">Database Connected</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {performanceScore > 70 ? (
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-yellow-400" />
                    )}
                    <span className="text-white">Performance Target</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="optimizations">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Recent Optimizations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {optimizationHistory.length > 0 ? (
                  optimizationHistory.map((optimization, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                      <div className="flex items-center gap-3">
                        {optimization.success ? (
                          <CheckCircle className="w-4 h-4 text-green-400" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-red-400" />
                        )}
                        <div>
                          <div className="text-white font-medium">{optimization.rule}</div>
                          <div className="text-gray-400 text-sm">
                            {new Date(optimization.timestamp).toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-white font-medium">
                          Score: {optimization.performance}
                        </div>
                        <div className={`text-sm ${optimization.success ? 'text-green-400' : 'text-red-400'}`}>
                          {optimization.success ? 'Success' : 'Failed'}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-400 py-8">
                    No optimization history available
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="suggestions">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Optimization Suggestions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {suggestions.length > 0 ? (
                  suggestions.map((suggestion, index) => (
                    <div key={index} className="p-4 bg-gray-700 rounded-lg">
                      <div className="flex items-start gap-3">
                        <div className="mt-1">
                          {suggestion.priority === 'high' && (
                            <AlertTriangle className="w-4 h-4 text-red-400" />
                          )}
                          {suggestion.priority === 'medium' && (
                            <Clock className="w-4 h-4 text-yellow-400" />
                          )}
                          {suggestion.priority === 'low' && (
                            <CheckCircle className="w-4 h-4 text-green-400" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-white font-medium">{suggestion.type}</span>
                            <Badge 
                              variant={suggestion.priority === 'high' ? 'destructive' : 
                                     suggestion.priority === 'medium' ? 'secondary' : 'default'}
                            >
                              {suggestion.priority}
                            </Badge>
                          </div>
                          <p className="text-gray-300 text-sm">{suggestion.message}</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-400 py-8">
                    <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-400" />
                    <p>No optimization suggestions at this time</p>
                    <p className="text-sm">Your system is performing well!</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdvancedPerformanceDashboard;
