
import { useState } from 'react';
import Header from '@/components/sections/Header';
import Footer from '@/components/sections/Footer';
import CollaborativeWorkspace from '@/components/realtime/CollaborativeWorkspace';
import LiveBusinessFeed from '@/components/realtime/LiveBusinessFeed';
import LiveUserCounter from '@/components/realtime/LiveUserCounter';
import RealtimeStatusIndicator from '@/components/realtime/RealtimeStatusIndicator';
import CollaborativeEditor from '@/components/realtime/CollaborativeEditor';
import LiveChat from '@/components/realtime/LiveChat';
import NotificationCenter from '@/components/realtime/NotificationCenter';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Users, 
  MessageSquare, 
  Edit3, 
  Building2, 
  Zap,
  Video,
  FileText,
  Share2,
  Bell
} from 'lucide-react';

const Collaboration = () => {
  const [activeTab, setActiveTab] = useState('workspace');

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-700 to-gray-800 text-white">
      <Header />
      
      <main className="container mx-auto py-12 px-6">
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4 flex items-center justify-center space-x-3">
              <Zap className="w-10 h-10" />
              <span>Real-time Collaboration Hub</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Connect, collaborate, and work together in real-time with Alabama's business community
            </p>
          </div>

          {/* Status Bar */}
          <div className="flex items-center justify-center space-x-6">
            <RealtimeStatusIndicator />
            <LiveUserCounter />
            <div className="text-sm text-gray-400">
              Last updated: {new Date().toLocaleTimeString()}
            </div>
          </div>

          {/* Real-time Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-gray-900/80 backdrop-blur-sm border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Collaborations</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">47</div>
                <p className="text-xs text-muted-foreground">
                  Projects in progress
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/80 backdrop-blur-sm border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Live Messages</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1,234</div>
                <p className="text-xs text-muted-foreground">
                  Messages today
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/80 backdrop-blur-sm border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Documents Shared</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">89</div>
                <p className="text-xs text-muted-foreground">
                  This week
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/80 backdrop-blur-sm border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Video Calls</CardTitle>
                <Video className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">23</div>
                <p className="text-xs text-muted-foreground">
                  Active sessions
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="bg-gray-800 border-gray-700 w-full justify-start">
              <TabsTrigger value="workspace" className="flex items-center space-x-2">
                <Users className="w-4 h-4" />
                <span>Workspace</span>
              </TabsTrigger>
              <TabsTrigger value="chat" className="flex items-center space-x-2">
                <MessageSquare className="w-4 h-4" />
                <span>Live Chat</span>
              </TabsTrigger>
              <TabsTrigger value="editor" className="flex items-center space-x-2">
                <Edit3 className="w-4 h-4" />
                <span>Collaborative Editor</span>
              </TabsTrigger>
              <TabsTrigger value="business" className="flex items-center space-x-2">
                <Building2 className="w-4 h-4" />
                <span>Business Feed</span>
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center space-x-2">
                <Bell className="w-4 h-4" />
                <span>Notifications</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="workspace" className="space-y-6">
              <CollaborativeWorkspace />
            </TabsContent>

            <TabsContent value="chat" className="space-y-6">
              <LiveChat />
            </TabsContent>

            <TabsContent value="editor" className="space-y-6">
              <CollaborativeEditor />
            </TabsContent>

            <TabsContent value="business" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <LiveBusinessFeed />
                <Card className="bg-gray-900/80 backdrop-blur-sm border-gray-700">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Share2 className="w-5 h-5" />
                      <span>Quick Actions</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <Card className="bg-gray-800 border-gray-600 hover:bg-gray-700 transition-colors cursor-pointer">
                        <CardContent className="p-4 text-center">
                          <MessageSquare className="w-8 h-8 mx-auto mb-2" />
                          <div className="text-sm font-medium">Start Chat</div>
                        </CardContent>
                      </Card>
                      
                      <Card className="bg-gray-800 border-gray-600 hover:bg-gray-700 transition-colors cursor-pointer">
                        <CardContent className="p-4 text-center">
                          <Video className="w-8 h-8 mx-auto mb-2" />
                          <div className="text-sm font-medium">Video Call</div>
                        </CardContent>
                      </Card>
                      
                      <Card className="bg-gray-800 border-gray-600 hover:bg-gray-700 transition-colors cursor-pointer">
                        <CardContent className="p-4 text-center">
                          <FileText className="w-8 h-8 mx-auto mb-2" />
                          <div className="text-sm font-medium">New Document</div>
                        </CardContent>
                      </Card>
                      
                      <Card className="bg-gray-800 border-gray-600 hover:bg-gray-700 transition-colors cursor-pointer">
                        <CardContent className="p-4 text-center">
                          <Share2 className="w-8 h-8 mx-auto mb-2" />
                          <div className="text-sm font-medium">Share Screen</div>
                        </CardContent>
                      </Card>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-6">
              <NotificationCenter />
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Collaboration;
