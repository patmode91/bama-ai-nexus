
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Building2, 
  Star, 
  MapPin,
  Calendar,
  Download,
  RefreshCw
} from 'lucide-react';
import { analyticsService, AnalyticsMetrics, CategoryInsight, LocationInsight } from '@/services/analytics/analyticsService';
import { toast } from 'sonner';

const COLORS = ['#00C2FF', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#06B6D4'];

const AnalyticsDashboard = () => {
  const [metrics, setMetrics] = useState<AnalyticsMetrics | null>(null);
  const [categoryInsights, setCategoryInsights] = useState<CategoryInsight[]>([]);
  const [locationInsights, setLocationInsights] = useState<LocationInsight[]>([]);
  const [trendData, setTrendData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadAnalyticsData();
  }, []);

  const loadAnalyticsData = async () => {
    setIsLoading(true);
    try {
      const [metricsData, categoryData, locationData, trendsData] = await Promise.all([
        analyticsService.getOverviewMetrics(),
        analyticsService.getCategoryInsights(),
        analyticsService.getLocationInsights(),
        analyticsService.getTrendData('businesses', 'month')
      ]);

      setMetrics(metricsData);
      setCategoryInsights(categoryData);
      setLocationInsights(locationData);
      setTrendData(trendsData);
    } catch (error) {
      console.error('Analytics loading error:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    loadAnalyticsData();
    toast.success('Analytics data refreshed');
  };

  const exportData = () => {
    const data = {
      metrics,
      categoryInsights,
      locationInsights,
      trendData,
      exportedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `alabama-business-analytics-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    
    toast.success('Analytics data exported successfully');
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600">Comprehensive insights into Alabama's business ecosystem</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={exportData}>
            <Download className="w-4 h-4 mr-2" />
            Export Data
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Businesses</p>
                  <p className="text-2xl font-bold">{metrics.totalBusinesses.toLocaleString()}</p>
                </div>
                <Building2 className="w-8 h-8 text-blue-500" />
              </div>
              <div className="flex items-center mt-2">
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600">+{metrics.growthRate}% this month</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Verified Businesses</p>
                  <p className="text-2xl font-bold">{metrics.verifiedBusinesses}</p>
                </div>
                <Star className="w-8 h-8 text-yellow-500" />
              </div>
              <div className="flex items-center mt-2">
                <Badge variant="secondary">
                  {Math.round((metrics.verifiedBusinesses / metrics.totalBusinesses) * 100)}% verified
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Average Rating</p>
                  <p className="text-2xl font-bold">{metrics.averageRating}</p>
                </div>
                <Star className="w-8 h-8 text-orange-500" />
              </div>
              <div className="flex items-center mt-2">
                <span className="text-sm text-gray-600">out of 5.0</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Users</p>
                  <p className="text-2xl font-bold">{metrics.activeUsers}</p>
                </div>
                <Users className="w-8 h-8 text-purple-500" />
              </div>
              <div className="flex items-center mt-2">
                <Calendar className="w-4 h-4 text-gray-500 mr-1" />
                <span className="text-sm text-gray-600">Last 30 days</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Detailed Analytics */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="locations">Locations</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Category Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Business Categories Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryInsights.slice(0, 6)}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="businessCount"
                      label={({ category, percent }) => `${category} (${(percent * 100).toFixed(0)}%)`}
                    >
                      {categoryInsights.slice(0, 6).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Location Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Top Business Locations</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={locationInsights.slice(0, 6)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="location" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="businessCount" fill="#00C2FF" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="categories" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Category Performance Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {categoryInsights.map((category, index) => (
                  <div key={category.category} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      ></div>
                      <div>
                        <h3 className="font-semibold">{category.category}</h3>
                        <p className="text-sm text-gray-600">Top: {category.topBusiness}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-4">
                        <div>
                          <p className="text-sm text-gray-600">Businesses</p>
                          <p className="font-bold">{category.businessCount}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Avg Rating</p>
                          <p className="font-bold">{category.averageRating}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Growth</p>
                          <div className="flex items-center">
                            <TrendingUp className="w-3 h-3 text-green-500 mr-1" />
                            <span className="text-green-600 font-bold">+{category.growthPercentage}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="locations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Geographic Business Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {locationInsights.map((location, index) => (
                  <div key={location.location} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <MapPin className="w-5 h-5 text-blue-500" />
                      <div>
                        <h3 className="font-semibold">{location.location}</h3>
                        <p className="text-sm text-gray-600">
                          {location.categories.slice(0, 3).join(', ')}
                          {location.categories.length > 3 && ` +${location.categories.length - 3} more`}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-4">
                        <div>
                          <p className="text-sm text-gray-600">Businesses</p>
                          <p className="font-bold">{location.businessCount}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Avg Employees</p>
                          <p className="font-bold">{location.averageEmployees}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Categories</p>
                          <p className="font-bold">{location.categories.length}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Business Growth Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#00C2FF" 
                    strokeWidth={2}
                    dot={{ fill: '#00C2FF' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsDashboard;
