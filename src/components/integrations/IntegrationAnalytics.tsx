
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Activity, TrendingUp, Zap, AlertCircle, CheckCircle, Clock } from 'lucide-react';

const IntegrationAnalytics = () => {
  const [timeRange, setTimeRange] = useState('7d');

  // Mock analytics data
  const usageData = [
    { date: '2024-01-01', requests: 245, successful: 240, failed: 5 },
    { date: '2024-01-02', requests: 312, successful: 305, failed: 7 },
    { date: '2024-01-03', requests: 198, successful: 195, failed: 3 },
    { date: '2024-01-04', requests: 267, successful: 260, failed: 7 },
    { date: '2024-01-05', requests: 389, successful: 385, failed: 4 },
    { date: '2024-01-06', requests: 445, successful: 440, failed: 5 },
    { date: '2024-01-07', requests: 356, successful: 350, failed: 6 }
  ];

  const integrationPerformance = [
    { name: 'Zapier', requests: 1250, successRate: 98.4, avgResponseTime: 234 },
    { name: 'Slack', requests: 890, successRate: 99.2, avgResponseTime: 145 },
    { name: 'Webhook', requests: 567, successRate: 96.8, avgResponseTime: 312 },
    { name: 'API Access', requests: 234, successRate: 99.6, avgResponseTime: 89 }
  ];

  const eventDistribution = [
    { name: 'new_contact', value: 35, color: '#00C2FF' },
    { name: 'new_review', value: 28, color: '#22C55E' },
    { name: 'profile_update', value: 22, color: '#F59E0B' },
    { name: 'verification_status', value: 15, color: '#EF4444' }
  ];

  const recentEvents = [
    {
      id: '1',
      integration: 'Slack',
      event: 'new_review',
      status: 'success',
      timestamp: '2024-01-07T15:30:00Z',
      responseTime: 145
    },
    {
      id: '2',
      integration: 'Zapier',
      event: 'new_contact',
      status: 'success',
      timestamp: '2024-01-07T15:25:00Z',
      responseTime: 234
    },
    {
      id: '3',
      integration: 'Webhook',
      event: 'profile_update',
      status: 'failed',
      timestamp: '2024-01-07T15:20:00Z',
      responseTime: 0
    },
    {
      id: '4',
      integration: 'API Access',
      event: 'new_review',
      status: 'success',
      timestamp: '2024-01-07T15:15:00Z',
      responseTime: 89
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-500" />;
    }
  };

  const totalRequests = usageData.reduce((sum, day) => sum + day.requests, 0);
  const totalSuccessful = usageData.reduce((sum, day) => sum + day.successful, 0);
  const overallSuccessRate = ((totalSuccessful / totalRequests) * 100).toFixed(1);

  return (
    <div className="space-y-6">
      <Card className="bg-gray-900/80 backdrop-blur-sm border-gray-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="w-5 h-5" />
                <span>Integration Analytics</span>
              </CardTitle>
              <CardDescription>
                Monitor performance and usage of your integrations
              </CardDescription>
            </div>
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
          </div>
        </CardHeader>
      </Card>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gray-900/80 backdrop-blur-sm border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRequests.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +12% from last period
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/80 backdrop-blur-sm border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallSuccessRate}%</div>
            <p className="text-xs text-muted-foreground">
              +0.3% from last period
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/80 backdrop-blur-sm border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Integrations</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4</div>
            <p className="text-xs text-muted-foreground">
              2 added this month
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/80 backdrop-blur-sm border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">178ms</div>
            <p className="text-xs text-muted-foreground">
              -23ms from last period
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="usage" className="space-y-4">
        <TabsList className="bg-gray-800 border-gray-700">
          <TabsTrigger value="usage">Usage Trends</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="events">Event Distribution</TabsTrigger>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="usage" className="space-y-4">
          <Card className="bg-gray-900/80 backdrop-blur-sm border-gray-700">
            <CardHeader>
              <CardTitle>Request Volume</CardTitle>
              <CardDescription>
                Daily API requests and success rates over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={usageData}>
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
                  <Line 
                    type="monotone" 
                    dataKey="requests" 
                    stroke="#00C2FF" 
                    strokeWidth={2}
                    name="Total Requests"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="successful" 
                    stroke="#22C55E" 
                    strokeWidth={2}
                    name="Successful"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="failed" 
                    stroke="#EF4444" 
                    strokeWidth={2}
                    name="Failed"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card className="bg-gray-900/80 backdrop-blur-sm border-gray-700">
            <CardHeader>
              <CardTitle>Integration Performance</CardTitle>
              <CardDescription>
                Success rates and response times by integration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {integrationPerformance.map((integration, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
                    <div className="space-y-1">
                      <h4 className="font-medium">{integration.name}</h4>
                      <p className="text-sm text-gray-400">{integration.requests} requests</p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-sm font-medium">{integration.successRate}%</p>
                        <p className="text-xs text-gray-400">Success Rate</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{integration.avgResponseTime}ms</p>
                        <p className="text-xs text-gray-400">Avg Response</p>
                      </div>
                      <Badge 
                        variant={integration.successRate > 98 ? "default" : integration.successRate > 95 ? "secondary" : "destructive"}
                      >
                        {integration.successRate > 98 ? 'Excellent' : integration.successRate > 95 ? 'Good' : 'Needs Attention'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events" className="space-y-4">
          <Card className="bg-gray-900/80 backdrop-blur-sm border-gray-700">
            <CardHeader>
              <CardTitle>Event Type Distribution</CardTitle>
              <CardDescription>
                Breakdown of webhook events by type
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={eventDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {eventDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-6">
                {eventDistribution.map((event, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: event.color }}
                    />
                    <span className="text-sm">{event.name.replace('_', ' ')}</span>
                    <span className="text-sm text-gray-400">({event.value}%)</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card className="bg-gray-900/80 backdrop-blur-sm border-gray-700">
            <CardHeader>
              <CardTitle>Recent Integration Activity</CardTitle>
              <CardDescription>
                Latest webhook deliveries and API calls
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentEvents.map((event) => (
                  <div key={event.id} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(event.status)}
                      <div>
                        <p className="font-medium">{event.integration}</p>
                        <p className="text-sm text-gray-400">{event.event.replace('_', ' ')}</p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-sm">
                        {event.responseTime > 0 ? `${event.responseTime}ms` : 'Failed'}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(event.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
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

export default IntegrationAnalytics;
