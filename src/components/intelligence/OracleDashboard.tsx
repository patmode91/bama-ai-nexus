
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  TrendingUp, 
  AlertTriangle, 
  Target, 
  Zap,
  Eye,
  BarChart3,
  Activity,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { oracleAgent } from '@/services/ai/oracleAgent';

export const OracleDashboard: React.FC = () => {
  const [insights, setInsights] = useState<any[]>([]);
  const [models, setModels] = useState<any[]>([]);
  const [analysisStatus, setAnalysisStatus] = useState<any>({});
  const [selectedInsightType, setSelectedInsightType] = useState<string>('all');

  useEffect(() => {
    const loadData = () => {
      setInsights(oracleAgent.getInsights());
      setModels(oracleAgent.getModels());
      setAnalysisStatus(oracleAgent.getAnalysisStatus());
    };

    loadData();
    const interval = setInterval(loadData, 30000); // Refresh every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  const filteredInsights = selectedInsightType === 'all' 
    ? insights 
    : insights.filter(insight => insight.type === selectedInsightType);

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'prediction': return <Brain className="w-4 h-4" />;
      case 'forecast': return <TrendingUp className="w-4 h-4" />;
      case 'alert': return <AlertTriangle className="w-4 h-4" />;
      case 'recommendation': return <Target className="w-4 h-4" />;
      default: return <Eye className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getModelStatusIcon = (accuracy: number) => {
    if (accuracy > 0.85) return <CheckCircle className="w-4 h-4 text-green-500" />;
    if (accuracy > 0.7) return <AlertCircle className="w-4 h-4 text-yellow-500" />;
    return <XCircle className="w-4 h-4 text-red-500" />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Oracle Intelligence Dashboard</h1>
            <p className="text-gray-400">Advanced predictive analytics and market intelligence</p>
          </div>
          <div className="flex items-center space-x-2">
            {analysisStatus.isAnalyzing && (
              <div className="flex items-center space-x-2 text-[#00C2FF]">
                <Activity className="w-4 h-4 animate-pulse" />
                <span className="text-sm">Analyzing...</span>
              </div>
            )}
            <Badge variant="outline" className="text-white border-[#00C2FF]">
              {analysisStatus.activeModels} Active Models
            </Badge>
          </div>
        </div>

        {/* Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Insights</p>
                  <p className="text-2xl font-bold text-white">{analysisStatus.totalInsights || 0}</p>
                </div>
                <div className="bg-[#00C2FF]/20 p-3 rounded-lg">
                  <Brain className="w-6 h-6 text-[#00C2FF]" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">High Priority</p>
                  <p className="text-2xl font-bold text-white">{analysisStatus.highPriorityInsights || 0}</p>
                </div>
                <div className="bg-orange-500/20 p-3 rounded-lg">
                  <AlertTriangle className="w-6 h-6 text-orange-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Active Models</p>
                  <p className="text-2xl font-bold text-white">{analysisStatus.activeModels || 0}</p>
                </div>
                <div className="bg-green-500/20 p-3 rounded-lg">
                  <BarChart3 className="w-6 h-6 text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Last Analysis</p>
                  <p className="text-sm font-medium text-white">
                    {analysisStatus.lastAnalysis 
                      ? new Date(analysisStatus.lastAnalysis).toLocaleTimeString()
                      : 'Not yet'
                    }
                  </p>
                </div>
                <div className="bg-purple-500/20 p-3 rounded-lg">
                  <Clock className="w-6 h-6 text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="insights" className="space-y-6">
          <TabsList className="bg-gray-800 w-full">
            <TabsTrigger value="insights" className="flex-1">Live Insights</TabsTrigger>
            <TabsTrigger value="models" className="flex-1">Predictive Models</TabsTrigger>
            <TabsTrigger value="forecasts" className="flex-1">Market Forecasts</TabsTrigger>
          </TabsList>

          <TabsContent value="insights" className="space-y-6">
            {/* Insight Filters */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Filter Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {['all', 'prediction', 'forecast', 'alert', 'recommendation'].map(type => (
                    <Button
                      key={type}
                      variant={selectedInsightType === type ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedInsightType(type)}
                      className={selectedInsightType === type ? 'bg-[#00C2FF]' : ''}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Insights List */}
            <div className="space-y-4">
              {filteredInsights.map((insight) => (
                <Card key={insight.id} className="bg-gray-800 border-gray-700">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="bg-gray-700 p-2 rounded-lg">
                          {getInsightIcon(insight.type)}
                        </div>
                        <div>
                          <h3 className="text-white font-medium">{insight.title}</h3>
                          <p className="text-gray-400 text-sm">
                            {new Date(insight.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${getPriorityColor(insight.priority)}`} />
                        <Badge variant="outline" className="text-xs">
                          {Math.round(insight.confidence * 100)}% confidence
                        </Badge>
                      </div>
                    </div>
                    
                    <p className="text-gray-300 mb-4">{insight.description}</p>
                    
                    {insight.data && (
                      <div className="bg-gray-700/50 p-3 rounded-lg mb-4">
                        <pre className="text-xs text-gray-300 overflow-x-auto">
                          {JSON.stringify(insight.data, null, 2)}
                        </pre>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">Source: {insight.source}</span>
                      <Badge variant="outline" className={`${insight.priority === 'critical' ? 'border-red-500 text-red-400' : ''}`}>
                        {insight.priority.toUpperCase()}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {filteredInsights.length === 0 && (
                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="p-12 text-center">
                    <Eye className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                    <h3 className="text-white text-lg font-medium mb-2">No Insights Available</h3>
                    <p className="text-gray-400">Oracle is analyzing the market. Check back soon for predictions and insights.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="models" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {models.map((model) => (
                <Card key={model.id} className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-white">{model.name}</CardTitle>
                      {getModelStatusIcon(model.accuracy)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Accuracy</span>
                      <span className="text-white font-medium">{(model.accuracy * 100).toFixed(1)}%</span>
                    </div>
                    
                    <Progress value={model.accuracy * 100} className="h-2" />
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400 text-sm">Type</span>
                        <Badge variant="outline" className="text-xs">
                          {model.type.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400 text-sm">Last Trained</span>
                        <span className="text-white text-sm">
                          {new Date(model.lastTrained).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400 text-sm">Predictions</span>
                        <span className="text-white text-sm">{model.predictions.length}</span>
                      </div>
                    </div>
                    
                    <Button size="sm" className="w-full bg-[#00C2FF] hover:bg-[#00A8D8]">
                      <Zap className="w-4 h-4 mr-2" />
                      Generate Prediction
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="forecasts" className="space-y-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Market Forecasts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <TrendingUp className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                  <h3 className="text-white text-lg font-medium mb-2">Market Forecasts</h3>
                  <p className="text-gray-400 mb-4">
                    Advanced market forecasting capabilities are being prepared.
                  </p>
                  <Button className="bg-[#00C2FF] hover:bg-[#00A8D8]">
                    Request Market Forecast
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default OracleDashboard;
