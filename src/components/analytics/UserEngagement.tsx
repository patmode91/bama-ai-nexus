
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { 
  Users, 
  Clock, 
  MousePointer, 
  Eye, 
  TrendingUp,
  Calendar,
  Download,
  Filter
} from 'lucide-react';

const UserEngagement = () => {
  const [timeRange, setTimeRange] = useState('7d');
  const [activeTab, setActiveTab] = useState('overview');

  // Mock engagement data
  const engagementOverview = [
    { metric: 'Daily Active Users', value: 1247, change: '+12.3%', trend: 'up' },
    { metric: 'Session Duration', value: '4m 32s', change: '+8.7%', trend: 'up' },
    { metric: 'Page Views/Session', value: 3.8, change: '+15.2%', trend: 'up' },
    { metric: 'Bounce Rate', value: '32.1%', change: '-5.4%', trend: 'down' }
  ];

  const dailyEngagement = [
    { date: '2024-01-01', activeUsers: 1120, sessions: 1890, pageViews: 7234 },
    { date: '2024-01-02', activeUsers: 1340, sessions: 2100, pageViews: 8456 },
    { date: '2024-01-03', activeUsers: 1180, sessions: 1950, pageViews: 7890 },
    { date: '2024-01-04', activeUsers: 1420, sessions: 2300, pageViews: 9123 },
    { date: '2024-01-05', activeUsers: 1560, sessions: 2450, pageViews: 9876 },
    { date: '2024-01-06', activeUsers: 1380, sessions: 2200, pageViews: 8765 },
    { date: '2024-01-07', activeUsers: 1247, sessions: 2050, pageViews: 8234 }
  ];

  const userBehavior = [
    { page: 'Home', views: 12567, time: '2m 45s', bounceRate: 28.5 },
    { page: 'Business Directory', views: 9834, time: '5m 12s', bounceRate: 22.1 },
    { page: 'AI Search', views: 7234, time: '3m 28s', bounceRate: 35.7 },
    { page: 'Business Profile', views: 6789, time: '4m 56s', bounceRate: 18.9 },
    { page: 'Analytics', views: 4567, time: '6m 23s', bounceRate: 15.2 }
  ];

  const deviceBreakdown = [
    { name: 'Desktop', value: 45, color: '#00C2FF' },
    { name: 'Mobile', value: 38, color: '#22C55E' },
    { name: 'Tablet', value: 17, color: '#F59E0B' }
  ];

  const userJourney = [
    { step: 'Landing', users: 1000, conversion: 100 },
    { step: 'Browse', users: 780, conversion: 78 },
    { step: 'Search', users: 612, conversion: 61.2 },
    { step: 'View Profile', users: 445, conversion: 44.5 },
    { step: 'Contact/Save', users: 267, conversion: 26.7 },
    { step: 'Return Visit', users: 156, conversion: 15.6 }
  ];

  const COLORS = ['#00C2FF', '#22C55E', '#F59E0B', '#EF4444', '#8B5CF6'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">User Engagement Analytics</h2>
          <p className="text-gray-400">Track user behavior and engagement patterns</p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32 bg-gray-800 border-gray-600">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24h</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Engagement Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {engagementOverview.map((item, index) => (
          <Card key={index} className="bg-gray-900/80 backdrop-blur-sm border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-gray-400">{item.metric}</div>
                <Badge 
                  variant={item.trend === 'up' ? 'default' : 'destructive'}
                  className={`text-xs ${
                    item.trend === 'up' 
                      ? 'bg-green-400/20 text-green-400' 
                      : 'bg-red-400/20 text-red-400'
                  }`}
                >
                  {item.change}
                </Badge>
              </div>
              <div className="text-2xl font-bold text-white">{item.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-gray-800 border-gray-700">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="behavior">User Behavior</TabsTrigger>
          <TabsTrigger value="devices">Devices</TabsTrigger>
          <TabsTrigger value="journey">User Journey</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card className="bg-gray-900/80 backdrop-blur-sm border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Daily Engagement Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={dailyEngagement}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#9CA3AF"
                    tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  />
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
                    dataKey="activeUsers" 
                    stackId="1"
                    stroke="#00C2FF" 
                    fill="#00C2FF"
                    fillOpacity={0.6}
                    name="Active Users"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="sessions" 
                    stackId="2"
                    stroke="#22C55E" 
                    fill="#22C55E"
                    fillOpacity={0.6}
                    name="Sessions"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="pageViews" 
                    stackId="3"
                    stroke="#F59E0B" 
                    fill="#F59E0B"
                    fillOpacity={0.6}
                    name="Page Views"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="behavior" className="space-y-6">
          <Card className="bg-gray-900/80 backdrop-blur-sm border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Page Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {userBehavior.map((page, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
                    <div className="space-y-1">
                      <h4 className="font-medium text-white">{page.page}</h4>
                      <div className="flex items-center space-x-4 text-sm text-gray-400">
                        <span className="flex items-center">
                          <Eye className="w-3 h-3 mr-1" />
                          {page.views.toLocaleString()} views
                        </span>
                        <span className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {page.time}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-white">{page.bounceRate}%</div>
                      <div className="text-xs text-gray-400">Bounce Rate</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="devices" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-gray-900/80 backdrop-blur-sm border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Device Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={deviceBreakdown}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}%`}
                    >
                      {deviceBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/80 backdrop-blur-sm border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Device Insights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {deviceBreakdown.map((device, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: device.color }}
                      />
                      <span className="text-white">{device.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-white font-medium">{device.value}%</div>
                      <div className="text-xs text-gray-400">
                        {Math.round((device.value / 100) * 1247)} users
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="journey" className="space-y-6">
          <Card className="bg-gray-900/80 backdrop-blur-sm border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">User Journey Funnel</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={userJourney} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis type="number" stroke="#9CA3AF" />
                  <YAxis dataKey="step" type="category" stroke="#9CA3AF" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="users" fill="#00C2FF" />
                </BarChart>
              </ResponsiveContainer>
              
              <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-4">
                {userJourney.map((step, index) => (
                  <div key={index} className="text-center p-4 bg-gray-800/50 rounded-lg">
                    <div className="text-lg font-bold text-white">{step.conversion}%</div>
                    <div className="text-sm text-gray-400">{step.step}</div>
                    <div className="text-xs text-gray-500">{step.users} users</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserEngagement;
