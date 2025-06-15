
import { useState } from 'react';
import AuthGuard from '@/components/auth/AuthGuard';
import Header from '@/components/sections/Header';
import Footer from '@/components/sections/Footer';
import LiveChat from '@/components/realtime/LiveChat';
import LiveNotifications from '@/components/realtime/LiveNotifications';
import LiveActivityFeed from '@/components/realtime/LiveActivityFeed';
import CollaborativeEditor from '@/components/realtime/CollaborativeEditor';
import LiveBusinessUpdates from '@/components/realtime/LiveBusinessUpdates';
import LiveMarketIntelligence from '@/components/realtime/LiveMarketIntelligence';
import AgentCommunicationHub from '@/components/realtime/AgentCommunicationHub';
import EnhancedSearchInterface from '@/components/search/EnhancedSearchInterface';
import SEO from '@/components/seo/SEO';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Zap, 
  MessageSquare, 
  Bell, 
  Activity, 
  Edit3, 
  Users, 
  TrendingUp, 
  Building2, 
  BarChart3, 
  Brain,
  Search
} from 'lucide-react';

const Realtime = () => {
  const [activeTab, setActiveTab] = useState('search');

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-700 to-gray-800 text-white">
      <SEO 
        title="Real-time Features - Alabama Business Directory"
        description="Experience enhanced search, live chat, notifications, and AI-powered features. Stay connected with Alabama's business community in real-time."
        keywords="enhanced search, real-time chat, live notifications, activity feed, AI matching, Alabama business networking"
      />
      <Header />
      
      <main className="container mx-auto py-12 px-6">
        <AuthGuard>
          <div className="space-y-8">
            {/* Header */}
            <div className="text-center">
              <h1 className="text-4xl font-bold mb-4 flex items-center justify-center space-x-3">
                <Zap className="w-10 h-10" />
                <span>Enhanced Real-time Features</span>
              </h1>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Advanced search, AI-powered matching, and real-time collaboration tools for Alabama's business community
              </p>
            </div>

            {/* Real-time Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-gray-900/80 backdrop-blur-sm border-gray-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">234</div>
                  <p className="text-xs text-muted-foreground">
                    Online right now
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gray-900/80 backdrop-blur-sm border-gray-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Enhanced Searches</CardTitle>
                  <Search className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">1,847</div>
                  <p className="text-xs text-muted-foreground">
                    Searches today
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gray-900/80 backdrop-blur-sm border-gray-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">AI Matches</CardTitle>
                  <Brain className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">156</div>
                  <p className="text-xs text-muted-foreground">
                    Generated today
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gray-900/80 backdrop-blur-sm border-gray-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Live Activities</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">89</div>
                  <p className="text-xs text-muted-foreground">
                    In the last hour
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="bg-gray-800 border-gray-700 w-full justify-start grid grid-cols-8">
                <TabsTrigger value="search" className="flex items-center space-x-2">
                  <Search className="w-4 h-4" />
                  <span>Enhanced Search</span>
                </TabsTrigger>
                <TabsTrigger value="chat" className="flex items-center space-x-2">
                  <MessageSquare className="w-4 h-4" />
                  <span>Live Chat</span>
                </TabsTrigger>
                <TabsTrigger value="notifications" className="flex items-center space-x-2">
                  <Bell className="w-4 h-4" />
                  <span>Notifications</span>
                </TabsTrigger>
                <TabsTrigger value="activity" className="flex items-center space-x-2">
                  <Activity className="w-4 h-4" />
                  <span>Activity Feed</span>
                </TabsTrigger>
                <TabsTrigger value="business" className="flex items-center space-x-2">
                  <Building2 className="w-4 h-4" />
                  <span>Business Updates</span>
                </TabsTrigger>
                <TabsTrigger value="intelligence" className="flex items-center space-x-2">
                  <BarChart3 className="w-4 h-4" />
                  <span>Market Intel</span>
                </TabsTrigger>
                <TabsTrigger value="agents" className="flex items-center space-x-2">
                  <Brain className="w-4 h-4" />
                  <span>AI Agents</span>
                </TabsTrigger>
                <TabsTrigger value="editor" className="flex items-center space-x-2">
                  <Edit3 className="w-4 h-4" />
                  <span>Collaborative</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="search" className="space-y-6">
                <EnhancedSearchInterface />
              </TabsContent>

              <TabsContent value="chat" className="space-y-6">
                <LiveChat />
              </TabsContent>

              <TabsContent value="notifications" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <LiveNotifications />
                  <Card className="bg-gray-900/80 backdrop-blur-sm border-gray-700">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <TrendingUp className="w-5 h-5" />
                        <span>Notification Insights</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-400">47</div>
                          <div className="text-sm text-gray-400">Unread</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-400">123</div>
                          <div className="text-sm text-gray-400">This Week</div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Business Updates</span>
                          <span className="text-red-400">34%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>AI Matches</span>
                          <span className="text-blue-400">28%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Events</span>
                          <span className="text-purple-400">23%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Chat Messages</span>
                          <span className="text-yellow-400">15%</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="activity" className="space-y-6">
                <LiveActivityFeed />
              </TabsContent>

              <TabsContent value="business" className="space-y-6">
                <LiveBusinessUpdates />
              </TabsContent>

              <TabsContent value="intelligence" className="space-y-6">
                <LiveMarketIntelligence />
              </TabsContent>

              <TabsContent value="agents" className="space-y-6">
                <AgentCommunicationHub />
              </TabsContent>

              <TabsContent value="editor" className="space-y-6">
                <CollaborativeEditor />
              </TabsContent>
            </Tabs>
          </div>
        </AuthGuard>
      </main>
      
      <Footer />
    </div>
  );
};

export default Realtime;
