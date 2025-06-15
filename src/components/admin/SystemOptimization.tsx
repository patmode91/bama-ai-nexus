
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { 
  Zap, 
  Settings, 
  TrendingUp, 
  CheckCircle, 
  AlertTriangle,
  Play,
  RotateCcw,
  Lightbulb
} from 'lucide-react';
import { systemOptimizer } from '@/services/systemOptimizer';
import { usePerformanceMonitoring } from '@/hooks/usePerformanceMonitoring';

const SystemOptimization = () => {
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationResult, setOptimizationResult] = useState<any>(null);
  const { score } = usePerformanceMonitoring();

  const handleRunOptimization = async () => {
    setIsOptimizing(true);
    try {
      const result = await systemOptimizer.runOptimization();
      setOptimizationResult(result);
    } catch (error) {
      console.error('Optimization failed:', error);
    } finally {
      setIsOptimizing(false);
    }
  };

  const optimizationHistory = systemOptimizer.getOptimizationHistory().slice(-10);
  const suggestions = systemOptimizer.getOptimizationSuggestions();

  const performanceData = [
    { time: '1h ago', score: score - 15 },
    { time: '45m ago', score: score - 12 },
    { time: '30m ago', score: score - 8 },
    { time: '15m ago', score: score - 3 },
    { time: 'Now', score: score }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">System Optimization</h2>
          <p className="text-gray-400">Automated performance optimization and system tuning</p>
        </div>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleRunOptimization}
            disabled={isOptimizing}
          >
            {isOptimizing ? (
              <RotateCcw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Play className="w-4 h-4 mr-2" />
            )}
            {isOptimizing ? 'Optimizing...' : 'Run Optimization'}
          </Button>
        </div>
      </div>

      {/* Optimization Result Alert */}
      {optimizationResult && (
        <Alert className={`border-${optimizationResult.improvement > 0 ? 'green' : 'yellow'}-400/50 bg-${optimizationResult.improvement > 0 ? 'green' : 'yellow'}-400/10`}>
          <CheckCircle className={`h-4 w-4 text-${optimizationResult.improvement > 0 ? 'green' : 'yellow'}-400`} />
          <AlertDescription className={`text-${optimizationResult.improvement > 0 ? 'green' : 'yellow'}-200`}>
            <div className="font-medium mb-2">Optimization Complete!</div>
            <p>Performance score improved by {optimizationResult.improvement.toFixed(1)} points 
            ({optimizationResult.beforeScore.toFixed(1)} → {optimizationResult.afterScore.toFixed(1)})</p>
          </AlertDescription>
        </Alert>
      )}

      {/* Current Performance Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gray-900/80 backdrop-blur-sm border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 rounded-lg bg-blue-400/10">
                <Zap className="w-5 h-5 text-blue-400" />
              </div>
              <Badge 
                variant={score >= 80 ? 'default' : 'destructive'}
                className={`${score >= 80 ? 'bg-green-400/20 text-green-400' : 'bg-red-400/20 text-red-400'}`}
              >
                {score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : 'Needs Work'}
              </Badge>
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-300">Current Performance Score</h3>
              <p className="text-2xl font-bold text-white">{score.toFixed(1)}/100</p>
              <Progress value={score} className="h-2 bg-gray-700" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/80 backdrop-blur-sm border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 rounded-lg bg-green-400/10">
                <Settings className="w-5 h-5 text-green-400" />
              </div>
              <Badge variant="secondary" className="bg-gray-700/50">
                Active
              </Badge>
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-300">Auto-Optimization</h3>
              <p className="text-2xl font-bold text-white">Enabled</p>
              <p className="text-xs text-gray-400">Every 30 minutes</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/80 backdrop-blur-sm border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 rounded-lg bg-purple-400/10">
                <TrendingUp className="w-5 h-5 text-purple-400" />
              </div>
              <Badge variant="secondary" className="bg-gray-700/50">
                {optimizationHistory.length}
              </Badge>
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-300">Optimizations Applied</h3>
              <p className="text-2xl font-bold text-white">Today</p>
              <p className="text-xs text-gray-400">Last 24 hours</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Trends */}
      <Card className="bg-gray-900/80 backdrop-blur-sm border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Performance Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="time" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" domain={[0, 100]} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="score" 
                stroke="#00C2FF" 
                strokeWidth={3}
                dot={{ fill: '#00C2FF', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Optimization Suggestions */}
        <Card className="bg-gray-900/80 backdrop-blur-sm border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Lightbulb className="w-5 h-5 mr-2 text-yellow-400" />
              Optimization Suggestions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {suggestions.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
                <p className="text-gray-300">All systems optimized!</p>
                <p className="text-sm text-gray-400">No immediate optimizations needed</p>
              </div>
            ) : (
              suggestions.map((suggestion, index) => (
                <div key={index} className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-white">{suggestion.type} Optimization</h4>
                    <Badge 
                      variant={suggestion.priority === 'high' ? 'destructive' : 'secondary'}
                      className={`text-xs ${
                        suggestion.priority === 'high' 
                          ? 'bg-red-400/20 text-red-400' 
                          : 'bg-yellow-400/20 text-yellow-400'
                      }`}
                    >
                      {suggestion.priority}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-300">{suggestion.message}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Recent Optimizations */}
        <Card className="bg-gray-900/80 backdrop-blur-sm border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Recent Optimizations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {optimizationHistory.length === 0 ? (
              <div className="text-center py-8">
                <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-300">No optimizations yet</p>
                <p className="text-sm text-gray-400">Run your first optimization to see results</p>
              </div>
            ) : (
              optimizationHistory.map((optimization, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {optimization.success ? (
                      <CheckCircle className="w-4 h-4 text-green-400" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-red-400" />
                    )}
                    <div>
                      <p className="text-sm font-medium text-white">{optimization.rule}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(optimization.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-white">{optimization.performance.toFixed(1)}</p>
                    <p className="text-xs text-gray-400">score</p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SystemOptimization;
