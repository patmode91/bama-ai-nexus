import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRealtime } from '@/hooks/useRealtime';
import { 
  Activity, 
  TrendingUp, 
  Users, 
  MessageSquare, 
  Building2,
  BarChart3,
  PieChart,
  LineChart,
  Zap,
  Clock,
  Target
} from 'lucide-react';
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Cell, BarChart, Bar, Pie } from 'recharts';

interface AnalyticsMetric {
  id: string;
  name: string;
  value: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  timestamp: number;
}

interface UserActivity {
  timestamp: number;
  activeUsers: number;
  pageViews: number;
  interactions: number;
}

const RealtimeAnalyticsDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<AnalyticsMetric[]>([
    { id: 'active_users', name: 'Active Users', value: 1247, change: 12.5, trend: 'up', timestamp: Date.now() },
    { id: 'page_views', name: 'Page Views', value: 8934, change: -2.3, trend: 'down', timestamp: Date.now() },
    { id: 'interactions', name: 'Interactions', value: 2156, change: 8.7, trend: 'up', timestamp: Date.now() },
    { id: 'bounce_rate', name: 'Bounce Rate', value: 34.2, change: -5.1, trend: 'up', timestamp: Date.now() }
  ]);

  const [userActivity, setUserActivity] = useState<UserActivity[]>([
    { timestamp: Date.now() - 3600000, activeUsers: 1150, pageViews: 8200, interactions: 1950 },
    { timestamp: Date.now() - 2700000, activeUsers: 1180, pageViews: 8350, interactions: 2020 },
    { timestamp: Date.now() - 1800000, activeUsers: 1220, pageViews: 8600, interactions: 2100 },
    { timestamp: Date.now() - 900000, activeUsers: 1247, pageViews: 8934, interactions: 2156 }
  ]);

  const [categoryData] = useState([
    { name: 'Technology', value: 35, color: '#3B82F6' },
    { name: 'Healthcare', value: 28, color: '#10B981' },
    { name: 'Finance', value: 22, color: '#F59E0B' },
    { name: 'Education', value: 15, color: '#EF4444' }
  ]);

  const { events } = useRealtime({
    channel: 'analytics-updates',
    eventTypes: ['user_activity', 'business_update']
  });

  useEffect(() => {
    // Simulate real-time metric updates
    const interval = setInterval(() => {
      setMetrics(prev => prev.map(metric => ({
        ...metric,
        value: metric.value + (Math.random() - 0.5) * 10,
        change: (Math.random() - 0.5) * 20,
        trend: Math.random() > 0.5 ? 'up' : 'down',
        timestamp: Date.now()
      })));

      setUserActivity(prev => {
        const newActivity: UserActivity = {
          timestamp: Date.now(),
          activeUsers: Math.floor(1200 + Math.random() * 100),
          pageViews: Math.floor(8800 + Math.random() * 300),
          interactions: Math.floor(2100 + Math.random() * 100)
        };
        return [...prev.slice(-9), newActivity];
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down': return <TrendingUp className="w-4 h-4 text-red-500 rotate-180" />;
      default: return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white">Real-time Analytics</h2>
          <p className="text-gray-400">Live insights and performance metrics</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <Badge variant="outline" className="text-green-400 border-green-400">
            Live
          </Badge>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <Card key={metric.id} className="bg-gray-900/80 backdrop-blur-sm border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">
                {metric.name}
              </CardTitle>
              {getTrendIcon(metric.trend)}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {metric.value.toLocaleString()}
              </div>
              <p className={`text-xs ${metric.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {metric.change >= 0 ? '+' : ''}{metric.change.toFixed(1)}% from last hour
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="bg-gray-800 border-gray-700">
          <TabsTrigger value="overview" className="flex items-center space-x-2">
            <BarChart3 className="w-4 h-4" />
            <span>Overview</span>
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center space-x-2">
            <Users className="w-4 h-4" />
            <span>Users</span>
          </TabsTrigger>
          <TabsTrigger value="business" className="flex items-center space-x-2">
            <Building2 className="w-4 h-4" />
            <span>Business</span>
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center space-x-2">
            <Zap className="w-4 h-4" />
            <span>Performance</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-gray-900/80 backdrop-blur-sm border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <LineChart className="w-5 h-5" />
                  <span>User Activity Trends</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsLineChart data={userActivity}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis 
                      dataKey="timestamp" 
                      tickFormatter={formatTime}
                      stroke="#9CA3AF"
                    />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip 
                      labelFormatter={(value) => formatTime(value as number)}
                      contentStyle={{ 
                        backgroundColor: '#1F2937', 
                        border: '1px solid #374151',
                        borderRadius: '8px'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="activeUsers" 
                      stroke="#3B82F6" 
                      strokeWidth={2}
                      name="Active Users"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="pageViews" 
                      stroke="#10B981" 
                      strokeWidth={2}
                      name="Page Views"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="interactions" 
                      stroke="#F59E0B" 
                      strokeWidth={2}
                      name="Interactions"
                    />
                  </RechartsLineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/80 backdrop-blur-sm border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <PieChart className="w-5 h-5" />
                  <span>Business Categories</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1F2937', 
                        border: '1px solid #374151',
                        borderRadius: '8px'
                      }}
                    />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-gray-900/80 backdrop-blur-sm border-gray-700">
              <CardHeader>
                <CardTitle className="text-sm">New Users Today</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-400">342</div>
                <p className="text-xs text-green-400">+18.2% vs yesterday</p>
              </CardContent>
            </Card>
            <Card className="bg-gray-900/80 backdrop-blur-sm border-gray-700">
              <CardHeader>
                <CardTitle className="text-sm">Session Duration</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-400">8m 42s</div>
                <p className="text-xs text-green-400">+12.5% vs last week</p>
              </CardContent>
            </Card>
            <Card className="bg-gray-900/80 backdrop-blur-sm border-gray-700">
              <CardHeader>
                <CardTitle className="text-sm">Retention Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-400">78.3%</div>
                <p className="text-xs text-red-400">-2.1% vs last month</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="business" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-gray-900/80 backdrop-blur-sm border-gray-700">
              <CardHeader>
                <CardTitle>Business Growth</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">New Listings</span>
                    <span className="text-lg font-semibold text-white">47</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Verified Businesses</span>
                    <span className="text-lg font-semibold text-white">1,234</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Active Profiles</span>
                    <span className="text-lg font-semibold text-white">892</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-900/80 backdrop-blur-sm border-gray-700">
              <CardHeader>
                <CardTitle>Top Performing Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {categoryData.map((category, index) => (
                    <div key={category.name} className="flex items-center space-x-3">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                      <span className="text-sm text-gray-300 flex-1">{category.name}</span>
                      <span className="text-sm font-semibold text-white">{category.value}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-gray-900/80 backdrop-blur-sm border-gray-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Page Load Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-400">1.2s</div>
                <p className="text-xs text-green-400">-200ms improvement</p>
              </CardContent>
            </Card>
            <Card className="bg-gray-900/80 backdrop-blur-sm border-gray-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">API Response</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-400">245ms</div>
                <p className="text-xs text-green-400">Within target</p>
              </CardContent>
            </Card>
            <Card className="bg-gray-900/80 backdrop-blur-sm border-gray-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Uptime</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-400">99.9%</div>
                <p className="text-xs text-gray-400">Last 30 days</p>
              </CardContent>
            </Card>
            <Card className="bg-gray-900/80 backdrop-blur-sm border-gray-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Error Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-400">0.02%</div>
                <p className="text-xs text-red-400">+0.01% vs target</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RealtimeAnalyticsDashboard;
