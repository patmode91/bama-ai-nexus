
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  Building2, 
  Activity,
  Target,
  Zap,
  Brain,
  Globe,
  Calendar,
  Download
} from 'lucide-react';

interface MetricCard {
  title: string;
  value: string;
  change: number;
  icon: React.ComponentType<any>;
  color: string;
}

const EnterpriseAnalyticsDashboard: React.FC = () => {
  const [timeRange, setTimeRange] = useState('30d');
  const [isLoading, setIsLoading] = useState(false);

  const metricsData: MetricCard[] = [
    {
      title: 'Total Revenue',
      value: '$2.4M',
      change: 12.5,
      icon: DollarSign,
      color: 'text-green-500'
    },
    {
      title: 'Active Users',
      value: '24,657',
      change: 8.2,
      icon: Users,
      color: 'text-blue-500'
    },
    {
      title: 'Business Listings',
      value: '1,234',
      change: 15.3,
      icon: Building2,
      color: 'text-purple-500'
    },
    {
      title: 'AI Interactions',
      value: '89.2K',
      change: 23.7,
      icon: Brain,
      color: 'text-orange-500'
    }
  ];

  const revenueData = [
    { month: 'Jan', revenue: 65000, users: 1200 },
    { month: 'Feb', revenue: 72000, users: 1350 },
    { month: 'Mar', revenue: 68000, users: 1280 },
    { month: 'Apr', revenue: 78000, users: 1450 },
    { month: 'May', revenue: 85000, users: 1600 },
    { month: 'Jun', revenue: 92000, users: 1750 },
    { month: 'Jul', revenue: 88000, users: 1680 },
    { month: 'Aug', revenue: 95000, users: 1820 },
    { month: 'Sep', revenue: 105000, users: 1950 },
    { month: 'Oct', revenue: 112000, users: 2100 },
    { month: 'Nov', revenue: 118000, users: 2250 },
    { month: 'Dec', revenue: 125000, users: 2400 }
  ];

  const categoryData = [
    { name: 'AI/ML', value: 35, color: '#00C2FF' },
    { name: 'SaaS', value: 25, color: '#8B5CF6' },
    { name: 'FinTech', value: 20, color: '#10B981' },
    { name: 'HealthTech', value: 12, color: '#F59E0B' },
    { name: 'EdTech', value: 8, color: '#EF4444' }
  ];

  const performanceData = [
    { metric: 'API Response Time', value: 125, target: 200, unit: 'ms' },
    { metric: 'System Uptime', value: 99.9, target: 99.5, unit: '%' },
    { metric: 'User Satisfaction', value: 94, target: 90, unit: '%' },
    { metric: 'Data Accuracy', value: 97.8, target: 95, unit: '%' }
  ];

  const exportData = () => {
    setIsLoading(true);
    // Simulate export
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Enterprise Analytics</h1>
          <p className="text-gray-400 mt-1">Comprehensive business intelligence and performance metrics</p>
        </div>
        <div className="flex items-center space-x-3">
          <select 
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="bg-gray-800 border border-gray-600 text-white rounded-lg px-3 py-2"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          <Button onClick={exportData} disabled={isLoading}>
            <Download className="w-4 h-4 mr-2" />
            {isLoading ? 'Exporting...' : 'Export'}
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid md:grid-cols-4 gap-4">
        {metricsData.map((metric, index) => (
          <Card key={index} className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">{metric.title}</p>
                  <p className="text-2xl font-bold text-white mt-1">{metric.value}</p>
                  <div className="flex items-center mt-2">
                    {metric.change > 0 ? (
                      <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                    )}
                    <span className={`text-sm ${metric.change > 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {metric.change > 0 ? '+' : ''}{metric.change}%
                    </span>
                  </div>
                </div>
                <div className={`p-3 rounded-lg bg-gray-700`}>
                  <metric.icon className={`w-6 h-6 ${metric.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="revenue" className="space-y-4">
        <TabsList className="bg-gray-800 border-gray-700">
          <TabsTrigger value="revenue">Revenue Analytics</TabsTrigger>
          <TabsTrigger value="users">User Analytics</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="space-y-6">
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Revenue Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={revenueData}>
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
                      <Area 
                        type="monotone" 
                        dataKey="revenue" 
                        stroke="#00C2FF" 
                        fill="#00C2FF"
                        fillOpacity={0.3}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
            
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Revenue by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  {categoryData.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-sm text-gray-300">{item.name}</span>
                      </div>
                      <span className="text-sm text-white">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">User Growth</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={revenueData}>
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
                  <Line 
                    type="monotone" 
                    dataKey="users" 
                    stroke="#8B5CF6" 
                    strokeWidth={3}
                    dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {performanceData.map((item, index) => (
              <Card key={index} className="bg-gray-800 border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-white">{item.metric}</h3>
                    <Badge variant={item.value >= item.target ? 'default' : 'destructive'}>
                      {item.value >= item.target ? 'On Target' : 'Below Target'}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Current</span>
                      <span className="text-white">{item.value}{item.unit}</span>
                    </div>
                    <Progress 
                      value={item.unit === '%' ? item.value : (item.value / item.target) * 100} 
                      className="h-2"
                    />
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Target</span>
                      <span className="text-gray-300">{item.target}{item.unit}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Brain className="w-5 h-5 text-blue-500" />
                  AI-Generated Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-blue-600/10 border border-blue-600/30 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <TrendingUp className="w-5 h-5 text-blue-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-white">Growth Opportunity</h4>
                      <p className="text-sm text-gray-300 mt-1">
                        AI/ML sector shows 35% growth potential. Consider increasing investment in this category.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-yellow-600/10 border border-yellow-600/30 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <Target className="w-5 h-5 text-yellow-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-white">Performance Alert</h4>
                      <p className="text-sm text-gray-300 mt-1">
                        API response time approaching threshold. Optimization recommended.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-green-600/10 border border-green-600/30 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <Zap className="w-5 h-5 text-green-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-white">Success Pattern</h4>
                      <p className="text-sm text-gray-300 mt-1">
                        User engagement peaks at 2-4 PM. Schedule content accordingly.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Activity className="w-5 h-5 text-purple-500" />
                  Predictive Analytics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-400">Revenue Forecast (Next Month)</span>
                      <span className="text-sm text-white">$135K (+8%)</span>
                    </div>
                    <Progress value={78} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-400">User Growth Forecast</span>
                      <span className="text-sm text-white">2,650 (+10.4%)</span>
                    </div>
                    <Progress value={82} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-400">Market Expansion</span>
                      <span className="text-sm text-white">High Confidence</span>
                    </div>
                    <Progress value={91} className="h-2" />
                  </div>
                </div>

                <div className="mt-6 p-4 bg-gray-900 rounded-lg">
                  <h4 className="font-medium text-white mb-2">Key Recommendations</h4>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li>• Focus on AI/ML business acquisitions</li>
                    <li>• Optimize server infrastructure</li>
                    <li>• Expand marketing in Q1 2024</li>
                    <li>• Implement advanced analytics features</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnterpriseAnalyticsDashboard;
