
import { useState } from 'react';
import AuthGuard from '@/components/auth/AuthGuard';
import Header from '@/components/sections/Header';
import Footer from '@/components/sections/Footer';
import SocialFeed from '@/components/social/SocialFeed';
import BusinessNetworking from '@/components/social/BusinessNetworking';
import CommunityGroups from '@/components/social/CommunityGroups';
import CollaborationHub from '@/components/social/CollaborationHub';
import SEO from '@/components/seo/SEO';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, MessageSquare, Handshake, Share2, TrendingUp, Calendar } from 'lucide-react';

const Community = () => {
  const [activeTab, setActiveTab] = useState('feed');

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-700 to-gray-800 text-white">
      <SEO 
        title="Community Hub - Alabama Business Directory"
        description="Connect, collaborate, and grow with Alabama's business community. Join groups, share experiences, find networking opportunities, and build lasting business relationships."
        keywords="business community, networking, collaboration, Alabama business groups, social feed, partnerships"
      />
      <Header />
      
      <main className="container mx-auto py-12 px-6">
        <AuthGuard>
          <div className="space-y-8">
            {/* Header */}
            <div className="text-center">
              <h1 className="text-4xl font-bold mb-4 flex items-center justify-center space-x-3">
                <Users className="w-10 h-10" />
                <span>Community Hub</span>
              </h1>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Connect, collaborate, and grow with Alabama's vibrant business community
              </p>
            </div>

            {/* Community Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-gray-900/80 backdrop-blur-sm border-gray-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Members</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">2,847</div>
                  <p className="text-xs text-muted-foreground">
                    +12% from last month
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gray-900/80 backdrop-blur-sm border-gray-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Community Groups</CardTitle>
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">156</div>
                  <p className="text-xs text-muted-foreground">
                    Across all industries
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gray-900/80 backdrop-blur-sm border-gray-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Collaborations</CardTitle>
                  <Handshake className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">89</div>
                  <p className="text-xs text-muted-foreground">
                    Active opportunities
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gray-900/80 backdrop-blur-sm border-gray-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Events This Month</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">24</div>
                  <p className="text-xs text-muted-foreground">
                    Networking events
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="bg-gray-800 border-gray-700 w-full justify-start">
                <TabsTrigger value="feed" className="flex items-center space-x-2">
                  <Share2 className="w-4 h-4" />
                  <span>Community Feed</span>
                </TabsTrigger>
                <TabsTrigger value="networking" className="flex items-center space-x-2">
                  <Users className="w-4 h-4" />
                  <span>Networking</span>
                </TabsTrigger>
                <TabsTrigger value="groups" className="flex items-center space-x-2">
                  <MessageSquare className="w-4 h-4" />
                  <span>Groups</span>
                </TabsTrigger>
                <TabsTrigger value="collaboration" className="flex items-center space-x-2">
                  <Handshake className="w-4 h-4" />
                  <span>Collaboration</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="feed" className="space-y-6">
                <SocialFeed />
              </TabsContent>

              <TabsContent value="networking" className="space-y-6">
                <BusinessNetworking />
              </TabsContent>

              <TabsContent value="groups" className="space-y-6">
                <CommunityGroups />
              </TabsContent>

              <TabsContent value="collaboration" className="space-y-6">
                <CollaborationHub />
              </TabsContent>
            </Tabs>
          </div>
        </AuthGuard>
      </main>
      
      <Footer />
    </div>
  );
};

export default Community;
