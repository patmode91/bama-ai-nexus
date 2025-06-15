
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Brain, 
  TrendingUp, 
  AlertTriangle, 
  Target, 
  CheckCircle, 
  XCircle,
  Lightbulb,
  BarChart3,
  RefreshCw
} from 'lucide-react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { businessInsightsService, BusinessInsight, PerformanceMetrics, BusinessHealth } from '@/services/analytics/businessInsightsService';

interface BusinessInsightsDashboardProps {
  businessId: number;
}

const BusinessInsightsDashboard: React.FC<BusinessInsightsDashboardProps> = ({ businessId }) => {
  const [insights, setInsights] = useState<BusinessInsight[]>([]);
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [health, setHealth] = useState<BusinessHealth | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBusinessAnalytics();
  }, [businessId]);

  const loadBusinessAnalytics = async () => {
    setLoading(true);
    try {
      const [insightsData, metricsData, healthData] = await Promise.all([
        businessInsightsService.getBusinessInsights(businessId),
        businessInsightsService.getPerformanceMetrics(businessId),
        businessInsightsService.getBusinessHealth(businessId)
      ]);
      
      setInsights(insightsData);
      setMetrics(metricsData);
      setHealth(healthData);
    } catch (error) {
      console.error('Failed to load business analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'performance':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'opportunity':
        return <Target className="h-4 w-4 text-blue-500" />;
      case 'risk':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'trend':
        return <BarChart3 className="h-4 w-4 text-purple-500" />;
      default:
        return <Brain className="h-4 w-4 text-gray-500" />;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'performance':
        return 'border-l-green-500 bg-green-50';
      case 'opportunity':
        return 'border-l-blue-500 bg-blue-50';
      case 'risk':
        return 'border-l-red-500 bg-red-50';
      case 'trend':
        return 'border-l-purple-500 bg-purple-50';
      default:
        return 'border-l-gray-500 bg-gray-50';
    }
  };

  const getHealthGradeColor = (grade: string) => {
    switch (grade) {
      case 'A':
        return 'text-green-600 bg-green-100';
      case 'B':
        return 'text-blue-600 bg-blue-100';
      case 'C':
        return 'text-yellow-600 bg-yellow-100';
      case 'D':
        return 'text-orange-600 bg-orange-100';
      case 'F':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  const radarData = metrics ? [
    { subject: 'Visibility', A: metrics.metrics.visibility, fullMark: 100 },
    { subject: 'Engagement', A: metrics.metrics.engagement, fullMark: 100 },
    { subject: 'Reputation', A: metrics.metrics.reputation, fullMark: 100 },
    { subject: 'Growth', A: metrics.metrics.growth, fullMark: 100 },
    { subject: 'Competitiveness', A: metrics.metrics.competitiveness, fullMark: 100 }
  ] : [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Business Insights</h2>
          <p className="text-gray-600">AI-powered analysis and recommendations</p>
        </div>
        <Button variant="outline" onClick={loadBusinessAnalytics}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Analysis
        </Button>
      </div>

      {/* Business Health Score */}
      {health && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Business Health Score</span>
              <Badge className={`text-lg px-3 py-1 ${getHealthGradeColor(health.grade)}`}>
                {health.grade}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">{health.score}/100</div>
              <Progress value={health.score} className="w-full max-w-md mx-auto" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Strengths
                </h4>
                {health.strengths.length > 0 ? (
                  <ul className="space-y-1">
                    {health.strengths.map((strength, index) => (
                      <li key={index} className="text-sm text-gray-600 flex items-center gap-2">
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        {strength}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500">No significant strengths identified</p>
                )}
              </div>

              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-red-500" />
                  Areas for Improvement
                </h4>
                {health.improvements.length > 0 ? (
                  <ul className="space-y-1">
                    {health.improvements.map((improvement, index) => (
                      <li key={index} className="text-sm text-gray-600 flex items-center gap-2">
                        <XCircle className="h-3 w-3 text-red-500" />
                        {improvement}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500">No major improvements needed</p>
                )}
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Health Factors</h4>
              <div className="space-y-3">
                {health.factors.map((factor, index) => (
                  <div key={index} className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">{factor.name}</span>
                      <span className="text-sm text-gray-600">{factor.score}/100</span>
                    </div>
                    <Progress value={factor.score} />
                    <p className="text-xs text-gray-500">{factor.impact}</p>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Performance Metrics */}
      {metrics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance Radar</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} />
                    <Radar
                      name="Performance"
                      dataKey="A"
                      stroke="#3b82f6"
                      fill="#3b82f6"
                      fillOpacity={0.3}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Benchmarking</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="text-lg font-bold text-blue-600">{metrics.benchmarks.industry}</div>
                    <div className="text-xs text-blue-700">Industry Avg</div>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <div className="text-lg font-bold text-green-600">{metrics.benchmarks.local}</div>
                    <div className="text-xs text-green-700">Local Avg</div>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <div className="text-lg font-bold text-purple-600">{metrics.benchmarks.category}</div>
                    <div className="text-xs text-purple-700">Category Avg</div>
                  </div>
                </div>

                <div className="h-32">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={metrics.trends.monthly.map((value, index) => ({ 
                      month: `M${index + 1}`, 
                      performance: value 
                    }))}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="performance" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* AI Insights */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Brain className="h-5 w-5" />
          AI-Generated Insights
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {insights.map((insight) => (
            <Alert key={insight.id} className={`border-l-4 ${getInsightColor(insight.type)}`}>
              <div className="flex items-start gap-3">
                {getInsightIcon(insight.type)}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold">{insight.title}</h4>
                    <Badge variant={insight.impact === 'high' ? 'destructive' : insight.impact === 'medium' ? 'default' : 'secondary'}>
                      {insight.impact} impact
                    </Badge>
                  </div>
                  <AlertDescription className="mb-3">
                    {insight.description}
                  </AlertDescription>
                  
                  {insight.actionable && insight.recommendations.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-1 text-sm font-medium">
                        <Lightbulb className="h-3 w-3" />
                        Recommendations:
                      </div>
                      <ul className="text-sm space-y-1">
                        {insight.recommendations.map((rec, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <span className="w-1 h-1 bg-current rounded-full" />
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </Alert>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BusinessInsightsDashboard;
