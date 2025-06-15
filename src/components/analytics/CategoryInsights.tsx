import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  Treemap,
  Cell
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Building2, 
  Star, 
  Users, 
  DollarSign,
  Target,
  Award,
  Filter,
  Download
} from 'lucide-react';

const CategoryInsights = () => {
  const [timeRange, setTimeRange] = useState('30d');
  const [sortBy, setSortBy] = useState('businessCount');

  // Mock category data
  const categoryData = [
    {
      category: 'Technology',
      businessCount: 145,
      averageRating: 4.3,
      growthRate: 18.5,
      marketShare: 22.1,
      revenue: 2340000,
      topBusiness: 'Alabama Tech Solutions',
      color: '#00C2FF'
    },
    {
      category: 'Healthcare',
      businessCount: 89,
      averageRating: 4.6,
      growthRate: 12.3,
      marketShare: 13.6,
      revenue: 3450000,
      topBusiness: 'Southern Medical Group',
      color: '#22C55E'
    },
    {
      category: 'Manufacturing',
      businessCount: 76,
      averageRating: 4.1,
      growthRate: 8.7,
      marketShare: 11.6,
      revenue: 4560000,
      topBusiness: 'Steel City Manufacturing',
      color: '#F59E0B'
    },
    {
      category: 'Food Service',
      businessCount: 112,
      averageRating: 4.4,
      growthRate: 15.2,
      marketShare: 17.1,
      revenue: 1890000,
      topBusiness: 'Southern Comfort Catering',
      color: '#EF4444'
    },
    {
      category: 'Construction',
      businessCount: 68,
      averageRating: 4.2,
      growthRate: 6.8,
      marketShare: 10.4,
      revenue: 3210000,
      topBusiness: 'Green Valley Construction',
      color: '#8B5CF6'
    },
    {
      category: 'Retail',
      businessCount: 94,
      averageRating: 4.0,
      growthRate: -2.1,
      marketShare: 14.3,
      revenue: 2100000,
      topBusiness: 'Alabama Marketplace',
      color: '#06B6D4'
    },
    {
      category: 'Professional Services',
      businessCount: 58,
      averageRating: 4.5,
      growthRate: 22.4,
      marketShare: 8.9,
      revenue: 1780000,
      topBusiness: 'Legal Eagles LLC',
      color: '#F97316'
    }
  ];

  const growthTrends = [
    { month: 'Jan', Technology: 120, Healthcare: 75, Manufacturing: 65, 'Food Service': 95 },
    { month: 'Feb', Technology: 125, Healthcare: 78, Manufacturing: 67, 'Food Service': 98 },
    { month: 'Mar', Technology: 130, Healthcare: 82, Manufacturing: 70, 'Food Service': 102 },
    { month: 'Apr', Technology: 135, Healthcare: 85, Manufacturing: 72, 'Food Service': 106 },
    { month: 'May', Technology: 140, Healthcare: 87, Manufacturing: 74, 'Food Service': 110 },
    { month: 'Jun', Technology: 145, Healthcare: 89, Manufacturing: 76, 'Food Service': 112 }
  ];

  const performanceMetrics = [
    { metric: 'Highest Growth', category: 'Professional Services', value: '+22.4%', icon: TrendingUp, color: 'text-green-400' },
    { metric: 'Best Rating', category: 'Healthcare', value: '4.6/5.0', icon: Star, color: 'text-yellow-400' },
    { metric: 'Most Businesses', category: 'Technology', value: '145', icon: Building2, color: 'text-blue-400' },
    { metric: 'Highest Revenue', category: 'Manufacturing', value: '$4.56M', icon: DollarSign, color: 'text-emerald-400' }
  ];

  const treeMapData = categoryData.map(cat => ({
    name: cat.category,
    size: cat.businessCount,
    fill: cat.color
  }));

  const sortedData = [...categoryData].sort((a, b) => {
    switch (sortBy) {
      case 'growthRate':
        return b.growthRate - a.growthRate;
      case 'averageRating':
        return b.averageRating - a.averageRating;
      case 'revenue':
        return b.revenue - a.revenue;
      default:
        return b.businessCount - a.businessCount;
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Category Insights</h2>
          <p className="text-gray-400">Analyze performance across business categories</p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-48 bg-gray-800 border-gray-600">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="businessCount">Sort by Business Count</SelectItem>
              <SelectItem value="growthRate">Sort by Growth Rate</SelectItem>
              <SelectItem value="averageRating">Sort by Rating</SelectItem>
              <SelectItem value="revenue">Sort by Revenue</SelectItem>
            </SelectContent>
          </Select>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32 bg-gray-800 border-gray-600">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7d</SelectItem>
              <SelectItem value="30d">Last 30d</SelectItem>
              <SelectItem value="90d">Last 90d</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Performance Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {performanceMetrics.map((metric, index) => (
          <Card key={index} className="bg-gray-900/80 backdrop-blur-sm border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <metric.icon className={`w-6 h-6 ${metric.color}`} />
                <Badge variant="secondary" className="bg-gray-700/50">
                  Best
                </Badge>
              </div>
              <div className="space-y-2">
                <h3 className="text-sm text-gray-400">{metric.metric}</h3>
                <p className="text-xl font-bold text-white">{metric.value}</p>
                <p className="text-sm text-gray-300">{metric.category}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-gray-800 border-gray-700">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="growth">Growth Trends</TabsTrigger>
          <TabsTrigger value="distribution">Distribution</TabsTrigger>
          <TabsTrigger value="comparison">Comparison</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {sortedData.map((category, index) => (
              <Card key={index} className="bg-gray-900/80 backdrop-blur-sm border-gray-700">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: category.color }}
                      />
                      <div>
                        <h3 className="font-semibold text-white">{category.category}</h3>
                        <p className="text-sm text-gray-400">Top: {category.topBusiness}</p>
                      </div>
                    </div>
                    <Badge 
                      variant={category.growthRate > 0 ? 'default' : 'destructive'}
                      className={`${
                        category.growthRate > 0 
                          ? 'bg-green-400/20 text-green-400' 
                          : 'bg-red-400/20 text-red-400'
                      }`}
                    >
                      {category.growthRate > 0 ? '+' : ''}{category.growthRate}%
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        <Building2 className="w-4 h-4 text-blue-400" />
                        <span className="text-sm text-gray-400">Businesses</span>
                      </div>
                      <p className="text-lg font-bold text-white">{category.businessCount}</p>
                    </div>

                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        <Star className="w-4 h-4 text-yellow-400" />
                        <span className="text-sm text-gray-400">Rating</span>
                      </div>
                      <p className="text-lg font-bold text-white">{category.averageRating}</p>
                    </div>

                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        <Target className="w-4 h-4 text-purple-400" />
                        <span className="text-sm text-gray-400">Market Share</span>
                      </div>
                      <p className="text-lg font-bold text-white">{category.marketShare}%</p>
                    </div>

                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        <DollarSign className="w-4 h-4 text-emerald-400" />
                        <span className="text-sm text-gray-400">Revenue</span>
                      </div>
                      <p className="text-lg font-bold text-white">
                        ${(category.revenue / 1000000).toFixed(1)}M
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="growth" className="space-y-6">
          <Card className="bg-gray-900/80 backdrop-blur-sm border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Category Growth Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={growthTrends}>
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
                  <Line type="monotone" dataKey="Technology" stroke="#00C2FF" strokeWidth={2} />
                  <Line type="monotone" dataKey="Healthcare" stroke="#22C55E" strokeWidth={2} />
                  <Line type="monotone" dataKey="Manufacturing" stroke="#F59E0B" strokeWidth={2} />
                  <Line type="monotone" dataKey="Food Service" stroke="#EF4444" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="distribution" className="space-y-6">
          <Card className="bg-gray-900/80 backdrop-blur-sm border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Business Distribution by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <Treemap
                  data={treeMapData}
                  dataKey="size"
                  aspectRatio={4/3}
                  stroke="#374151"
                  fill="#8884d8"
                >
                  {treeMapData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Treemap>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comparison" className="space-y-6">
          <Card className="bg-gray-900/80 backdrop-blur-sm border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Category Performance Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={categoryData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="category" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="businessCount" fill="#00C2FF" name="Business Count" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CategoryInsights;
