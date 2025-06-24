
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Brain, 
  TrendingUp, 
  Target, 
  Lightbulb, 
  AlertCircle, 
  CheckCircle,
  Search,
  Filter,
  Download,
  Share2,
  Zap,
  BarChart3,
  Users,
  Building2
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

interface Insight {
  id: string;
  type: 'opportunity' | 'risk' | 'trend' | 'anomaly';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  confidence: number;
  actionable: boolean;
  timestamp: number;
  data?: any;
}

interface MarketTrend {
  category: string;
  growth: number;
  volume: number;
  momentum: 'accelerating' | 'stable' | 'declining';
  forecast: number[];
}

const BusinessIntelligenceHub: React.FC = () => {
  const [insights, setInsights] = useState<Insight[]>([
    {
      id: '1',
      type: 'opportunity',
      title: 'Emerging Market in Healthcare Tech',
      description: 'Growing demand for telehealth solutions with 34% increase in searches',
      impact: 'high',
      confidence: 87,
      actionable: true,
      timestamp: Date.now() - 1800000
    },
    {
      id: '2',
      type: 'trend',
      title: 'Sustainable Business Practices Trending',
      description: 'Businesses highlighting sustainability see 23% more engagement',
      impact: 'medium',
      confidence: 92,
      actionable: true,
      timestamp: Date.now() - 3600000
    },
    {
      id: '3',
      type: 'risk',
      title: 'Market Saturation in Traditional Retail',
      description: 'Declining new business registrations in retail sector',
      impact: 'medium',
      confidence: 78,
      actionable: false,
      timestamp: Date.now() - 7200000
    }
  ]);

  const [marketTrends] = useState<MarketTrend[]>([
    {
      category: 'Technology',
      growth: 12.5,
      volume: 1247,
      momentum: 'accelerating',
      forecast: [1100, 1150, 1200, 1247, 1290, 1340, 1395]
    },
    {
      category: 'Healthcare',
      growth: 8.3,
      volume: 892,
      momentum: 'stable',
      forecast: [820, 840, 860, 892, 910, 925, 940]
    },
    {
      category: 'Finance',
      growth: -2.1,
      volume: 634,
      momentum: 'declining',
      forecast: [680, 670, 650, 634, 625, 615, 605]
    }
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'opportunity': return <Target className="w-4 h-4 text-green-500" />;
      case 'risk': return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'trend': return <TrendingUp className="w-4 h-4 text-blue-500" />;
      case 'anomaly': return <Zap className="w-4 h-4 text-yellow-500" />;
      default: return <Lightbulb className="w-4 h-4 text-gray-500" />;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getMomentumColor = (momentum: string) => {
    switch (momentum) {
      case 'accelerating': return 'text-green-500';
      case 'stable': return 'text-blue-500';
      case 'declining': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const filteredInsights = insights.filter(insight => {
    const matchesSearch = insight.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         insight.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || insight.type === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white flex items-center space-x-3">
            <Brain className="w-8 h-8" />
            <span>Business Intelligence Hub</span>
          </h2>
          <p className="text-gray-400">AI-powered insights and market intelligence</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-1" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Share2 className="w-4 h-4 mr-1" />
            Share
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gray-900/80 backdrop-blur-sm border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Lightbulb className="w-5 h-5 text-yellow-500" />
              <div>
                <div className="text-2xl font-bold text-white">{insights.length}</div>
                <div className="text-sm text-gray-400">Active Insights</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-900/80 backdrop-blur-sm border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Target className="w-5 h-5 text-green-500" />
              <div>
                <div className="text-2xl font-bold text-white">
                  {insights.filter(i => i.actionable).length}
                </div>
                <div className="text-sm text-gray-400">Actionable Items</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-900/80 backdrop-blur-sm border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-blue-500" />
              <div>
                <div className="text-2xl font-bold text-white">
                  {marketTrends.filter(t => t.momentum === 'accelerating').length}
                </div>
                <div className="text-sm text-gray-400">Growing Markets</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-900/80 backdrop-blur-sm border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-purple-500" />
              <div>
                <div className="text-2xl font-bold text-white">94%</div>
                <div className="text-sm text-gray-400">Prediction Accuracy</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="insights" className="space-y-4">
        <TabsList className="bg-gray-800 border-gray-700">
          <TabsTrigger value="insights" className="flex items-center space-x-2">
            <Lightbulb className="w-4 h-4" />
            <span>Insights</span>
          </TabsTrigger>
          <TabsTrigger value="trends" className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4" />
            <span>Market Trends</span>
          </TabsTrigger>
          <TabsTrigger value="forecasts" className="flex items-center space-x-2">
            <BarChart3 className="w-4 h-4" />
            <span>Forecasts</span>
          </TabsTrigger>
          <TabsTrigger value="recommendations" className="flex items-center space-x-2">
            <Target className="w-4 h-4" />
            <span>Recommendations</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="insights" className="space-y-4">
          {/* Search and Filter */}
          <div className="flex space-x-4">
            <div className="flex-1">
              <Input
                placeholder="Search insights..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-gray-800 border-gray-700"
              />
            </div>
            <div className="flex space-x-2">
              {['all', 'opportunity', 'risk', 'trend', 'anomaly'].map((filter) => (
                <Button
                  key={filter}
                  variant={selectedFilter === filter ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedFilter(filter)}
                  className="capitalize"
                >
                  {filter}
                </Button>
              ))}
            </div>
          </div>

          {/* Insights List */}
          <ScrollArea className="h-[600px]">
            <div className="space-y-4">
              {filteredInsights.map((insight) => (
                <Card key={insight.id} className="bg-gray-900/80 backdrop-blur-sm border-gray-700">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0 mt-1">
                        {getInsightIcon(insight.type)}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="text-lg font-semibold text-white">{insight.title}</h3>
                          <Badge className={getImpactColor(insight.impact)}>
                            {insight.impact} impact
                          </Badge>
                          {insight.actionable && (
                            <Badge variant="outline" className="text-green-400 border-green-400">
                              Actionable
                            </Badge>
                          )}
                        </div>
                        
                        <p className="text-gray-300 mb-3">{insight.description}</p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="text-sm text-gray-400">
                              Confidence: <span className="font-medium text-white">{insight.confidence}%</span>
                            </div>
                            <div className="text-sm text-gray-400">
                              {new Date(insight.timestamp).toLocaleDateString()}
                            </div>
                          </div>
                          
                          {insight.actionable && (
                            <Button size="sm">
                              Take Action
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {marketTrends.map((trend) => (
              <Card key={trend.category} className="bg-gray-900/80 backdrop-blur-sm border-gray-700">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{trend.category}</CardTitle>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className={getMomentumColor(trend.momentum)}>
                        {trend.momentum}
                      </Badge>
                      <span className={`text-sm font-medium ${trend.growth >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {trend.growth >= 0 ? '+' : ''}{trend.growth}%
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-400">Volume</span>
                      <span className="text-lg font-semibold text-white">{trend.volume}</span>
                    </div>
                    
                    <ResponsiveContainer width="100%" height={150}>
                      <AreaChart data={trend.forecast.map((value, index) => ({ 
                        week: `W${index + 1}`, 
                        value 
                      }))}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="week" stroke="#9CA3AF" />
                        <YAxis stroke="#9CA3AF" />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#1F2937', 
                            border: '1px solid #374151',
                            borderRadius: '8px'
                          }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="value" 
                          stroke="#3B82F6" 
                          fill="#3B82F6" 
                          fillOpacity={0.2}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="forecasts" className="space-y-4">
          <Card className="bg-gray-900/80 backdrop-blur-sm border-gray-700">
            <CardHeader>
              <CardTitle>Market Growth Predictions</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={marketTrends[0].forecast.map((value, index) => ({
                  month: `Month ${index + 1}`,
                  technology: marketTrends[0].forecast[index],
                  healthcare: marketTrends[1].forecast[index],
                  finance: marketTrends[2].forecast[index]
                }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px'
                    }}
                  />
                  <Line type="monotone" dataKey="technology" stroke="#3B82F6" strokeWidth={2} name="Technology" />
                  <Line type="monotone" dataKey="healthcare" stroke="#10B981" strokeWidth={2} name="Healthcare" />
                  <Line type="monotone" dataKey="finance" stroke="#F59E0B" strokeWidth={2} name="Finance" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          <div className="space-y-4">
            <Card className="bg-gray-900/80 backdrop-blur-sm border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <CheckCircle className="w-6 h-6 text-green-500 mt-1" />
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">
                      Expand Healthcare Technology Offerings
                    </h3>
                    <p className="text-gray-300 mb-3">
                      Based on market analysis, healthcare tech shows strong growth potential. 
                      Consider featuring more telehealth and medical device companies.
                    </p>
                    <div className="flex space-x-2">
                      <Badge className="bg-green-100 text-green-800">High Priority</Badge>
                      <Badge variant="outline">Market Opportunity</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/80 backdrop-blur-sm border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <Target className="w-6 h-6 text-blue-500 mt-1" />
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">
                      Enhance Sustainability Messaging
                    </h3>
                    <p className="text-gray-300 mb-3">
                      Businesses highlighting sustainability practices see higher engagement. 
                      Add sustainability badges and filtering options.
                    </p>
                    <div className="flex space-x-2">
                      <Badge className="bg-blue-100 text-blue-800">Medium Priority</Badge>
                      <Badge variant="outline">User Engagement</Badge>
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

export default BusinessIntelligenceHub;
