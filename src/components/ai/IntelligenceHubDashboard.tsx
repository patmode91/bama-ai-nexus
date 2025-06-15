
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Brain, 
  TrendingUp, 
  AlertTriangle, 
  Target, 
  Zap,
  Activity,
  BarChart3,
  Settings,
  Play,
  Pause,
  RefreshCw,
  Lightbulb
} from 'lucide-react';
import { intelligenceHubService } from '@/services/ai/intelligenceHubService';

const IntelligenceHubDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [insights, setInsights] = useState<any[]>([]);
  const [models, setModels] = useState<any[]>([]);
  const [automationRules, setAutomationRules] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      setInsights(intelligenceHubService.getInsights());
      setModels(intelligenceHubService.getModels());
      setAutomationRules(intelligenceHubService.getAutomationRules());
      setSummary(intelligenceHubService.getAnalysisSummary());
    } catch (error) {
      console.error('Error loading intelligence data:', error);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadData();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'default';
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'trend': return TrendingUp;
      case 'anomaly': return AlertTriangle;
      case 'opportunity': return Target;
      case 'risk': return AlertTriangle;
      default: return Lightbulb;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">AI Intelligence Hub</h1>
          <p className="text-gray-400 mt-2">Advanced analytics, predictions, and automated insights</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="border-gray-600 text-gray-300"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            variant="outline"
            className="border-gray-600 text-gray-300"
          >
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-[#00C2FF]" />
                <span className="text-sm font-medium text-gray-400">Active Models</span>
              </div>
              <p className="text-2xl font-bold text-white mt-1">{summary.activeModels}</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-yellow-400" />
                <span className="text-sm font-medium text-gray-400">Total Insights</span>
              </div>
              <p className="text-2xl font-bold text-white mt-1">{summary.totalInsights}</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                <span className="text-sm font-medium text-gray-400">High Priority</span>
              </div>
              <p className="text-2xl font-bold text-white mt-1">{summary.highSeverityInsights}</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-green-400" />
                <span className="text-sm font-medium text-gray-400">Automation Rules</span>
              </div>
              <p className="text-2xl font-bold text-white mt-1">{summary.activeAutomationRules}</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-gray-800 w-full">
          <TabsTrigger value="overview" className="flex-1">
            <Activity className="w-4 h-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex-1">
            <Lightbulb className="w-4 h-4 mr-2" />
            Insights
          </TabsTrigger>
          <TabsTrigger value="models" className="flex-1">
            <Brain className="w-4 h-4 mr-2" />
            Models
          </TabsTrigger>
          <TabsTrigger value="automation" className="flex-1">
            <Zap className="w-4 h-4 mr-2" />
            Automation
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Insights */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Lightbulb className="w-5 h-5" />
                  Recent Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {insights.slice(0, 5).map((insight) => {
                  const Icon = getInsightIcon(insight.type);
                  return (
                    <div key={insight.id} className="flex items-start gap-3 p-3 bg-gray-700 rounded-lg">
                      <Icon className="w-5 h-5 mt-0.5 text-[#00C2FF]" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-white font-medium text-sm">{insight.title}</p>
                          <Badge variant={getSeverityColor(insight.severity)} className="text-xs">
                            {insight.severity}
                          </Badge>
                        </div>
                        <p className="text-gray-400 text-sm">{insight.description}</p>
                        <p className="text-gray-500 text-xs mt-1">
                          Confidence: {(insight.confidence * 100).toFixed(0)}%
                        </p>
                      </div>
                    </div>
                  );
                })}
                {insights.length === 0 && (
                  <p className="text-gray-400 text-center py-8">No insights available yet</p>
                )}
              </CardContent>
            </Card>

            {/* Model Performance */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Model Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {models.map((model) => (
                  <div key={model.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-white text-sm font-medium">{model.name}</span>
                      <span className="text-gray-400 text-sm">{(model.accuracy * 100).toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-[#00C2FF] h-2 rounded-full transition-all" 
                        style={{ width: `${model.accuracy * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="insights">
          <div className="space-y-4">
            {insights.map((insight) => {
              const Icon = getInsightIcon(insight.type);
              return (
                <Card key={insight.id} className="bg-gray-800 border-gray-700">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <Icon className="w-6 h-6 mt-1 text-[#00C2FF]" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-white font-semibold">{insight.title}</h3>
                          <Badge variant={getSeverityColor(insight.severity)}>
                            {insight.severity}
                          </Badge>
                          <Badge variant="outline" className="border-gray-600 text-gray-300">
                            {insight.type}
                          </Badge>
                        </div>
                        <p className="text-gray-300 mb-3">{insight.description}</p>
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-gray-400">Recommendations:</p>
                          <ul className="list-disc list-inside space-y-1">
                            {insight.recommendations.map((rec: string, index: number) => (
                              <li key={index} className="text-sm text-gray-400">{rec}</li>
                            ))}
                          </ul>
                        </div>
                        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-700">
                          <span className="text-xs text-gray-500">
                            Confidence: {(insight.confidence * 100).toFixed(0)}%
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(insight.timestamp).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            {insights.length === 0 && (
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-12 text-center">
                  <Lightbulb className="w-12 h-12 mx-auto mb-4 text-gray-600" />
                  <p className="text-gray-400">No insights available yet. Analysis is running...</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="models">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {models.map((model) => (
              <Card key={model.id} className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center justify-between">
                    <span>{model.name}</span>
                    <Badge variant="outline" className="border-gray-600 text-gray-300">
                      {model.type}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-400 text-sm">Accuracy</p>
                      <p className="text-white font-semibold">{(model.accuracy * 100).toFixed(1)}%</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Predictions</p>
                      <p className="text-white font-semibold">{model.predictions.length}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Last Trained</p>
                    <p className="text-white text-sm">
                      {new Date(model.lastTrained).toLocaleString()}
                    </p>
                  </div>
                  <Button 
                    className="w-full bg-[#00C2FF] hover:bg-[#0099CC]"
                    onClick={() => {
                      const prediction = intelligenceHubService.generatePrediction(model.id, {});
                      console.log('Generated prediction:', prediction);
                      loadData();
                    }}
                  >
                    Generate Prediction
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="automation">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Automation Rules</h3>
              <Button className="bg-[#00C2FF] hover:bg-[#0099CC]">
                <Zap className="w-4 h-4 mr-2" />
                Create Rule
              </Button>
            </div>

            {automationRules.length > 0 ? (
              <div className="space-y-4">
                {automationRules.map((rule) => (
                  <Card key={rule.id} className="bg-gray-800 border-gray-700">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-white font-medium">{rule.name}</h4>
                        <div className="flex items-center gap-2">
                          <Badge variant={rule.enabled ? "default" : "secondary"}>
                            {rule.enabled ? "Active" : "Disabled"}
                          </Badge>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-gray-600 text-gray-300"
                          >
                            {rule.enabled ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                          </Button>
                        </div>
                      </div>
                      <p className="text-gray-400 text-sm mb-3">Trigger: {rule.trigger}</p>
                      <div className="text-xs text-gray-500">
                        Actions: {rule.actions.join(", ")}
                      </div>
                      {rule.lastExecuted && (
                        <div className="text-xs text-gray-500 mt-2">
                          Last executed: {new Date(rule.lastExecuted).toLocaleString()}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-12 text-center">
                  <Zap className="w-12 h-12 mx-auto mb-4 text-gray-600" />
                  <p className="text-gray-400 mb-4">No automation rules configured yet</p>
                  <Button className="bg-[#00C2FF] hover:bg-[#0099CC]">
                    Create Your First Rule
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default IntelligenceHubDashboard;
