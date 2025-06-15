
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingUp, TrendingDown, AlertTriangle, Target, Brain, RefreshCw } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { marketIntelligenceService, MarketTrend, MarketOpportunity } from '@/services/analytics/marketIntelligenceService';

const MarketIntelligenceDashboard = () => {
  const [trends, setTrends] = useState<MarketTrend[]>([]);
  const [opportunities, setOpportunities] = useState<MarketOpportunity[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMarketData();
  }, [selectedCategory]);

  const loadMarketData = async () => {
    setLoading(true);
    try {
      const [trendsData, opportunitiesData] = await Promise.all([
        marketIntelligenceService.getMarketTrends(selectedCategory === 'all' ? undefined : selectedCategory),
        marketIntelligenceService.getMarketOpportunities(selectedCategory === 'all' ? undefined : selectedCategory)
      ]);
      
      setTrends(trendsData);
      setOpportunities(opportunitiesData);
    } catch (error) {
      console.error('Failed to load market data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'rising':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'declining':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <TrendingUp className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'rising':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'declining':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getOpportunityColor = (potential: string) => {
    switch (potential) {
      case 'high':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'high':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Market Intelligence</h2>
          <p className="text-gray-600">Comprehensive market analysis and opportunities</p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="Technology">Technology</SelectItem>
              <SelectItem value="Healthcare">Healthcare</SelectItem>
              <SelectItem value="Retail">Retail</SelectItem>
              <SelectItem value="Construction">Construction</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={loadMarketData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <Tabs defaultValue="trends" className="space-y-6">
        <TabsList>
          <TabsTrigger value="trends">Market Trends</TabsTrigger>
          <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trends.map((trend) => (
              <Card key={trend.id} className={`border-l-4 ${getTrendColor(trend.trend)}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{trend.category}</CardTitle>
                    {getTrendIcon(trend.trend)}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={trend.trend === 'rising' ? 'default' : trend.trend === 'declining' ? 'destructive' : 'secondary'}>
                      {trend.change > 0 ? '+' : ''}{trend.change.toFixed(1)}%
                    </Badge>
                    <span className="text-sm text-gray-600">{trend.period}</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="h-32">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={trend.data.map((value, index) => ({ month: index + 1, value }))}>
                        <Line 
                          type="monotone" 
                          dataKey="value" 
                          stroke={trend.trend === 'rising' ? '#10b981' : trend.trend === 'declining' ? '#ef4444' : '#6b7280'}
                          strokeWidth={2}
                          dot={false}
                        />
                        <XAxis dataKey="month" hide />
                        <YAxis hide />
                        <Tooltip />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-2">
                    {trend.insights.map((insight, index) => (
                      <p key={index} className="text-xs text-gray-600">{insight}</p>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="opportunities" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {opportunities.map((opportunity) => (
              <Card key={opportunity.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{opportunity.title}</CardTitle>
                      <p className="text-sm text-gray-600 mt-1">{opportunity.category}</p>
                    </div>
                    <Badge className={getOpportunityColor(opportunity.potential)}>
                      {opportunity.potential} potential
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-700">{opportunity.description}</p>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Investment:</span>
                      <p className="text-gray-600">{opportunity.investmentRequired}</p>
                    </div>
                    <div>
                      <span className="font-medium">Timeframe:</span>
                      <p className="text-gray-600">{opportunity.timeframe}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <Badge className={getRiskColor(opportunity.riskLevel)}>
                      {opportunity.riskLevel} risk
                    </Badge>
                    <Button variant="outline" size="sm">
                      <Target className="h-4 w-4 mr-2" />
                      Learn More
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                AI-Powered Market Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    Growth Opportunities
                  </h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Technology sector showing 23% growth in Alabama</li>
                    <li>• Remote services experiencing high demand</li>
                    <li>• Sustainable solutions gaining market traction</li>
                    <li>• Healthcare services expanding rapidly</li>
                  </ul>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-semibold flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    Market Risks
                  </h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Increased competition in retail sector</li>
                    <li>• Economic uncertainty affecting discretionary spending</li>
                    <li>• Supply chain disruptions in manufacturing</li>
                    <li>• Changing consumer preferences post-pandemic</li>
                  </ul>
                </div>
              </div>

              <div className="pt-4 border-t">
                <h4 className="font-semibold mb-3">Market Predictions</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">68%</div>
                    <div className="text-sm text-blue-700">Businesses will increase digital investment</div>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">45%</div>
                    <div className="text-sm text-green-700">Growth in eco-friendly services</div>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">32%</div>
                    <div className="text-sm text-purple-700">Increase in remote service delivery</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MarketIntelligenceDashboard;
