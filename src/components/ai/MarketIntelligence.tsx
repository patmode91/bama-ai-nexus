import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  Target,
  Lightbulb,
  MapPin,
  DollarSign,
  Users,
  Calendar,
  RefreshCw,
  Download,
  Brain,
  Wifi,
  WifiOff
} from 'lucide-react';
import { aiService, MarketInsight } from '@/services/aiService';
import { useBusinesses } from '@/hooks/useBusinesses';
import { useMarketData } from '@/hooks/useMarketData';
import { marketDataService } from '@/services/marketDataService';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const MarketIntelligence = () => {
  const [insights, setInsights] = useState<MarketInsight[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const { data: businesses } = useBusinesses();
  const { data: marketData, isLoading: marketDataLoading, error: marketDataError, refetch } = useMarketData(selectedCategory);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    generateInsights();
  }, [businesses, marketData]);

  const generateInsights = async () => {
    setIsLoading(true);
    
    try {
      // Simulate AI processing
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const marketInsights = aiService.generateMarketInsights(
        selectedCategory === 'all' ? undefined : selectedCategory
      );
      
      setInsights(marketInsights);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error generating market insights:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      await refetch();
      await generateInsights();
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const clearCache = () => {
    marketDataService.clearCache();
    refetch();
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'growing':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'declining':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <BarChart3 className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'growing':
        return 'text-green-500 bg-green-500/10 border-green-500/30';
      case 'declining':
        return 'text-red-500 bg-red-500/10 border-red-500/30';
      default:
        return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/30';
    }
  };

  const growthData = [
    { month: 'Jan', technology: 12, healthcare: 8, aerospace: 5, automotive: 3 },
    { month: 'Feb', technology: 15, healthcare: 9, aerospace: 5, automotive: 4 },
    { month: 'Mar', technology: 18, healthcare: 10, aerospace: 6, automotive: 4 },
    { month: 'Apr', technology: 22, healthcare: 11, aerospace: 6, automotive: 5 },
    { month: 'May', technology: 25, healthcare: 12, aerospace: 7, automotive: 5 },
    { month: 'Jun', technology: 28, healthcare: 13, aerospace: 7, automotive: 6 }
  ];

  const industryDistribution = [
    { name: 'Technology', value: 35, companies: 157 },
    { name: 'Healthcare', value: 25, companies: 112 },
    { name: 'Manufacturing', value: 20, companies: 89 },
    { name: 'Aerospace', value: 15, companies: 67 },
    { name: 'Other', value: 5, companies: 23 }
  ];

  const exportInsights = () => {
    const content = insights.map(insight => `
${insight.category.toUpperCase()}
Trend: ${insight.trend} (${insight.growthRate}% growth)

Key Insights:
${insight.insights.map(item => `• ${item}`).join('\n')}

Opportunities:
${insight.opportunities.map(item => `• ${item}`).join('\n')}
`).join('\n---\n');

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'market-insights.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center text-white">
              <Brain className="w-5 h-5 mr-2 text-[#00C2FF]" />
              AI Market Intelligence
              <Badge className="ml-2 bg-purple-500 text-white">Live Data</Badge>
              {isOnline ? (
                <Wifi className="w-4 h-4 ml-2 text-green-500" />
              ) : (
                <WifiOff className="w-4 h-4 ml-2 text-red-500" />
              )}
            </CardTitle>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isLoading || marketDataLoading}
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${(isLoading || marketDataLoading) ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={clearCache}
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                Clear Cache
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={exportInsights}
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
          <div className="flex items-center space-x-4 text-sm">
            <p className="text-gray-300">
              Last updated: {lastUpdated.toLocaleString()}
            </p>
            {marketData && (
              <p className="text-gray-400">
                Market data: {new Date(marketData.lastUpdated).toLocaleString()}
              </p>
            )}
            {!isOnline && (
              <Badge variant="outline" className="border-red-500 text-red-500">
                Offline Mode
              </Badge>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Real-time Market Data Display */}
      {marketData && (
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Live Market Intelligence</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Latest News */}
              <div>
                <h4 className="font-semibold text-white mb-3">Latest News</h4>
                <div className="space-y-3">
                  {marketData.news.slice(0, 3).map((item, index) => (
                    <div key={index} className="bg-gray-700/50 rounded p-3">
                      <h5 className="font-medium text-gray-200 text-sm">{item.title}</h5>
                      <p className="text-xs text-gray-400 mt-1">{item.source}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Current Trends */}
              <div>
                <h4 className="font-semibold text-white mb-3">Current Trends</h4>
                <div className="space-y-2">
                  {marketData.trends.slice(0, 4).map((trend, index) => (
                    <Badge 
                      key={index} 
                      variant="outline" 
                      className="border-[#00C2FF]/30 text-[#00C2FF] bg-[#00C2FF]/10 text-xs"
                    >
                      {trend}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-gray-800 border-gray-700">
          <TabsTrigger value="overview" className="data-[state=active]:bg-[#00C2FF]">
            <BarChart3 className="w-4 h-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="trends" className="data-[state=active]:bg-[#00C2FF]">
            <TrendingUp className="w-4 h-4 mr-2" />
            Trends
          </TabsTrigger>
          <TabsTrigger value="opportunities" className="data-[state=active]:bg-[#00C2FF]">
            <Target className="w-4 h-4 mr-2" />
            Opportunities
          </TabsTrigger>
          <TabsTrigger value="analytics" className="data-[state=active]:bg-[#00C2FF]">
            <PieChart className="w-4 h-4 mr-2" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Total Market Size</p>
                    <p className="text-2xl font-bold text-white">$2.3B</p>
                  </div>
                  <DollarSign className="w-8 h-8 text-green-500" />
                </div>
                <div className="mt-2">
                  <Badge className="bg-green-500/10 text-green-500 border-green-500/30">
                    +12.5% YoY
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Active Companies</p>
                    <p className="text-2xl font-bold text-white">{businesses?.length || 0}</p>
                  </div>
                  <Users className="w-8 h-8 text-blue-500" />
                </div>
                <div className="mt-2">
                  <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/30">
                    +8.3% QoQ
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Growth Sectors</p>
                    <p className="text-2xl font-bold text-white">4</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-purple-500" />
                </div>
                <div className="mt-2">
                  <Badge className="bg-purple-500/10 text-purple-500 border-purple-500/30">
                    Tech Leading
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Avg Growth Rate</p>
                    <p className="text-2xl font-bold text-white">8.1%</p>
                  </div>
                  <Calendar className="w-8 h-8 text-yellow-500" />
                </div>
                <div className="mt-2">
                  <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/30">
                    Above National
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Industry Insights */}
          {isLoading ? (
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-6">
                <div className="animate-pulse space-y-4">
                  <div className="h-4 bg-gray-600 rounded w-1/4"></div>
                  <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="h-20 bg-gray-600 rounded"></div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {insights.map((insight, index) => (
                <Card key={index} className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-white text-lg">{insight.category}</CardTitle>
                      <div className="flex items-center space-x-2">
                        {getTrendIcon(insight.trend)}
                        <Badge className={getTrendColor(insight.trend)}>
                          {insight.trend} {insight.growthRate > 0 ? `+${insight.growthRate}%` : `${insight.growthRate}%`}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-semibold text-gray-300 mb-2">Key Insights</h4>
                        <ul className="space-y-1">
                          {insight.insights.slice(0, 3).map((item, itemIndex) => (
                            <li key={itemIndex} className="text-sm text-gray-400 flex items-start">
                              <span className="text-[#00C2FF] mr-2">•</span>
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-semibold text-gray-300 mb-2">Opportunities</h4>
                        <div className="flex flex-wrap gap-2">
                          {insight.opportunities.slice(0, 3).map((opportunity, oppIndex) => (
                            <Badge
                              key={oppIndex}
                              variant="outline"
                              className="text-xs border-green-500/30 text-green-400 bg-green-500/10"
                            >
                              {opportunity}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">6-Month Growth Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={growthData}>
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
                  <Line type="monotone" dataKey="technology" stroke="#00C2FF" strokeWidth={2} />
                  <Line type="monotone" dataKey="healthcare" stroke="#10B981" strokeWidth={2} />
                  <Line type="monotone" dataKey="aerospace" stroke="#F59E0B" strokeWidth={2} />
                  <Line type="monotone" dataKey="automotive" stroke="#8B5CF6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="opportunities" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center text-white">
                  <Lightbulb className="w-5 h-5 mr-2 text-yellow-500" />
                  Emerging Opportunities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { title: 'AI in Manufacturing', potential: 85, description: 'Automation and quality control systems' },
                    { title: 'Healthcare Analytics', potential: 78, description: 'Patient data analysis and diagnostics' },
                    { title: 'Smart Infrastructure', potential: 72, description: 'IoT and city management systems' },
                    { title: 'FinTech Solutions', potential: 68, description: 'Financial services digitization' }
                  ].map((opp, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <h4 className="font-semibold text-white">{opp.title}</h4>
                        <Badge className="bg-yellow-500 text-black">{opp.potential}% Potential</Badge>
                      </div>
                      <p className="text-sm text-gray-400">{opp.description}</p>
                      <Progress value={opp.potential} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center text-white">
                  <MapPin className="w-5 h-5 mr-2 text-red-500" />
                  Regional Hotspots
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { city: 'Huntsville', focus: 'Aerospace & Defense', growth: 92 },
                    { city: 'Birmingham', focus: 'Healthcare & Finance', growth: 78 },
                    { city: 'Mobile', focus: 'Manufacturing & Logistics', growth: 65 },
                    { city: 'Auburn', focus: 'Research & Development', growth: 71 }
                  ].map((region, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-semibold text-white">{region.city}</h4>
                          <p className="text-sm text-gray-400">{region.focus}</p>
                        </div>
                        <Badge className="bg-blue-500 text-white">{region.growth}% Active</Badge>
                      </div>
                      <Progress value={region.growth} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Industry Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={industryDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="companies" fill="#00C2FF" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MarketIntelligence;
