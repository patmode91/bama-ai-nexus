
import { Helmet } from 'react-helmet-async';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  MessageSquare, 
  Handshake, 
  Target 
} from 'lucide-react';
import Header from '@/components/sections/Header';
import Footer from '@/components/sections/Footer';
import NetworkingHub from '@/components/networking/NetworkingHub';
import CollaborationTools from '@/components/collaboration/CollaborationTools';

const Community = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>Business Community - Alabama Business Directory</title>
        <meta name="description" content="Connect, collaborate, and grow with Alabama's vibrant business community. Join forums, network with professionals, and participate in collaborative projects." />
      </Helmet>
      
      <Header />
      
      <main className="py-8">
        <div className="container mx-auto px-6">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Business Community
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Connect, collaborate, and grow with Alabama's vibrant business ecosystem. 
              Build meaningful relationships and drive innovation together.
            </p>
          </div>

          <Tabs defaultValue="networking" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-8">
              <TabsTrigger value="networking" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Networking
              </TabsTrigger>
              <TabsTrigger value="forums" className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Forums
              </TabsTrigger>
              <TabsTrigger value="collaboration" className="flex items-center gap-2">
                <Handshake className="w-4 h-4" />
                Collaboration
              </TabsTrigger>
              <TabsTrigger value="events" className="flex items-center gap-2">
                <Target className="w-4 h-4" />
                Events
              </TabsTrigger>
            </TabsList>

            <TabsContent value="networking">
              <NetworkingHub />
            </TabsContent>

            <TabsContent value="forums">
              <div className="p-6 text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Discussion Forums</h3>
                <p className="text-gray-600 mb-8">
                  Join industry-specific discussions, ask questions, and share insights with the community.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-6 bg-white rounded-lg border">
                    <MessageSquare className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                    <h4 className="font-semibold mb-2">General Business</h4>
                    <p className="text-sm text-gray-600">Open discussions about business strategies and trends</p>
                  </div>
                  <div className="p-6 bg-white rounded-lg border">
                    <Users className="w-12 h-12 text-green-500 mx-auto mb-4" />
                    <h4 className="font-semibold mb-2">Industry Specific</h4>
                    <p className="text-sm text-gray-600">Focused conversations by industry sector</p>
                  </div>
                  <div className="p-6 bg-white rounded-lg border">
                    <Target className="w-12 h-12 text-purple-500 mx-auto mb-4" />
                    <h4 className="font-semibold mb-2">Q&A</h4>
                    <p className="text-sm text-gray-600">Get answers from experienced professionals</p>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="collaboration">
              <CollaborationTools />
            </TabsContent>

            <TabsContent value="events">
              <div className="p-6 text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Community Events</h3>
                <p className="text-gray-600 mb-8">
                  Participate in networking events, workshops, and collaborative meetups.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-6 bg-white rounded-lg border">
                    <Users className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                    <h4 className="font-semibold mb-2">Networking Events</h4>
                    <p className="text-sm text-gray-600">Meet fellow business professionals in your area</p>
                  </div>
                  <div className="p-6 bg-white rounded-lg border">
                    <Target className="w-12 h-12 text-green-500 mx-auto mb-4" />
                    <h4 className="font-semibold mb-2">Workshops</h4>
                    <p className="text-sm text-gray-600">Learn new skills and industry best practices</p>
                  </div>
                  <div className="p-6 bg-white rounded-lg border">
                    <Handshake className="w-12 h-12 text-purple-500 mx-auto mb-4" />
                    <h4 className="font-semibold mb-2">Collaboration Sessions</h4>
                    <p className="text-sm text-gray-600">Work together on community initiatives</p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Community;
