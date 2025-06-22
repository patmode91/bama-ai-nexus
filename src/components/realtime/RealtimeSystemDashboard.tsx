
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Activity, 
  Zap, 
  Users, 
  MessageSquare, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3
} from 'lucide-react';
import { useRealtimeIntegration } from '@/hooks/useRealtimeIntegration';
import { useSystemNotifications } from '@/hooks/useRealtime';

const RealtimeSystemDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  
  const mainChannel = useRealtimeIntegration('system-dashboard', {
    enablePerformanceTracking: true,
    enableUserTracking: true,
    enableAutoOptimization: true
  });

  const chatChannel = useRealtimeIntegration('global-chat');
  const businessChannel = useRealtimeIntegration('business-updates');
  
  const { notifications, hasUnread } = useSystemNotifications();

  const getConnectionStatusColor = (health: string) => {
    switch (health) {
      case 'excellent': return 'bg-green-500';
      case 'fair': return 'bg-yellow-500';
      case 'poor': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getConnectionStatusIcon = (health: string) => {
    switch (health) {
      case 'excellent': return <CheckCircle className="w-4 h-4" />;
      case 'fair': return <Clock className="w-4 h-4" />;
      case 'poor': return <AlertTriangle className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white">Real-time System Dashboard</h2>
          <p className="text-gray-300 mt-2">Monitor and manage all real-time connections and performance</p>
        </div>
        <div className="flex items-center space-x-3">
          {hasUnread && (
            <Badge variant="destructive" className="animate-pulse">
              {notifications.length} New
            </Badge>
          )}
          <Button 
            onClick={mainChannel.forceOptimization}
            disabled={mainChannel.isOptimized}
            className="bg-[#00C2FF] hover:bg-[#0099CC]"
          >
            <Zap className="w-4 h-4 mr-2" />
            {mainChannel.isOptimized ? 'Optimized' : 'Optimize'}
          </Button>
        </div>
      </div>

      {/* Connection Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gray-900/80 backdrop-blur-sm border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Main Connection</CardTitle>
            {getConnectionStatusIcon(mainChannel.connectionHealth)}
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${getConnectionStatusColor(mainChannel.connectionHealth)}`} />
              <span className="text-2xl font-bold capitalize">{mainChannel.connectionHealth}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              {mainChannel.metrics.connectionLatency.toFixed(0)}ms latency
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/80 backdrop-blur-sm border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Events</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mainChannel.events.length}</div>
            <p className="text-xs text-muted-foreground">
              {mainChannel.metrics.messageRate.toFixed(1)} events/sec
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/80 backdrop-blur-sm border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chat Activity</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{chatChannel.events.length}</div>
            <p className="text-xs text-muted-foreground">
              {chatChannel.isConnected ? 'Connected' : 'Disconnected'}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/80 backdrop-blur-sm border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Business Updates</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{businessChannel.events.length}</div>
            <p className="text-xs text-muted-foreground">
              {businessChannel.isConnected ? 'Live' : 'Offline'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Dashboard */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-gray-800 border-gray-700">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="connections">Connections</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-gray-900/80 backdrop-blur-sm border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5" />
                  <span>System Performance</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Connection Latency</span>
                    <span>{mainChannel.metrics.connectionLatency.toFixed(0)}ms</span>
                  </div>
                  <Progress value={Math.min(mainChannel.metrics.connectionLatency / 10, 100)} />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Message Rate</span>
                    <span>{mainChannel.metrics.messageRate.toFixed(1)}/sec</span>
                  </div>
                  <Progress value={Math.min(mainChannel.metrics.messageRate * 2, 100)} />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Data Transfer</span>
                    <span>{(mainChannel.metrics.dataTransferRate / 1024).toFixed(1)} KB/s</span>
                  </div>
                  <Progress value={Math.min(mainChannel.metrics.dataTransferRate / 10, 100)} />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/80 backdrop-blur-sm border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="w-5 h-5" />
                  <span>Channel Status</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Main Dashboard</span>
                  <Badge variant={mainChannel.isConnected ? "default" : "destructive"}>
                    {mainChannel.connectionStatus}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Global Chat</span>
                  <Badge variant={chatChannel.isConnected ? "default" : "destructive"}>
                    {chatChannel.connectionStatus}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Business Updates</span>
                  <Badge variant={businessChannel.isConnected ? "default" : "destructive"}>
                    {businessChannel.connectionStatus}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance">
          <Card className="bg-gray-900/80 backdrop-blur-sm border-gray-700">
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-gray-800 rounded-lg">
                    <div className="text-2xl font-bold text-blue-400">
                      {mainChannel.metrics.connectionLatency.toFixed(0)}
                    </div>
                    <div className="text-sm text-gray-400">Latency (ms)</div>
                  </div>
                  <div className="text-center p-4 bg-gray-800 rounded-lg">
                    <div className="text-2xl font-bold text-green-400">
                      {mainChannel.metrics.messageRate.toFixed(1)}
                    </div>
                    <div className="text-sm text-gray-400">Messages/sec</div>
                  </div>
                  <div className="text-center p-4 bg-gray-800 rounded-lg">
                    <div className="text-2xl font-bold text-purple-400">
                      {(mainChannel.metrics.dataTransferRate / 1024).toFixed(1)}
                    </div>
                    <div className="text-sm text-gray-400">KB/s Transfer</div>
                  </div>
                  <div className="text-center p-4 bg-gray-800 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-400">
                      {mainChannel.metrics.activeConnections}
                    </div>
                    <div className="text-sm text-gray-400">Active Connections</div>
                  </div>
                </div>

                {mainChannel.lastOptimization && (
                  <div className="mt-4 p-4 bg-green-900/20 border border-green-700 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-5 h-5 text-green-400" />
                      <span className="text-green-300">
                        Last optimized: {mainChannel.lastOptimization.toLocaleString()}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="connections">
          <Card className="bg-gray-900/80 backdrop-blur-sm border-gray-700">
            <CardHeader>
              <CardTitle>Connection Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: 'Main Dashboard', channel: mainChannel, color: 'blue' },
                  { name: 'Global Chat', channel: chatChannel, color: 'green' },
                  { name: 'Business Updates', channel: businessChannel, color: 'purple' }
                ].map((conn) => (
                  <div key={conn.name} className="p-4 bg-gray-800 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{conn.name}</h4>
                      <Badge variant={conn.channel.isConnected ? "default" : "destructive"}>
                        {conn.channel.connectionStatus}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-400">Health: </span>
                        <span className="capitalize">{conn.channel.connectionHealth}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Events: </span>
                        <span>{conn.channel.events.length}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Latency: </span>
                        <span>{conn.channel.metrics.connectionLatency.toFixed(0)}ms</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card className="bg-gray-900/80 backdrop-blur-sm border-gray-700">
            <CardHeader>
              <CardTitle>System Notifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {notifications.length === 0 ? (
                  <p className="text-gray-400 text-center py-8">No notifications</p>
                ) : (
                  notifications.slice(0, 10).map((notification) => (
                    <div key={notification.id} className="p-3 bg-gray-800 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{notification.type}</span>
                        <span className="text-xs text-gray-400">
                          {new Date(notification.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-300 mt-1">
                        {JSON.stringify(notification.data)}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RealtimeSystemDashboard;
