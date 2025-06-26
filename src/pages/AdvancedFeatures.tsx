
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Bot, 
  Users, 
  BarChart3, 
  Sparkles, 
  ArrowLeft,
  Zap,
  Brain,
  Globe
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AdvancedAgentManager from '@/components/ai/AdvancedAgentManager';
import RealtimeCollaborationHub from '@/components/collaboration/RealtimeCollaborationHub';
import EnterpriseAnalyticsDashboard from '@/components/enterprise/EnterpriseAnalyticsDashboard';
import SEO from '@/components/seo/SEO';

const AdvancedFeatures: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    {
      id: 'agents',
      title: 'AI Agent Management',
      description: 'Advanced AI agent orchestration and performance monitoring',
      icon: Bot,
      color: 'text-blue-500',
      badge: 'AI Powered'
    },
    {
      id: 'collaboration',
      title: 'Real-time Collaboration',
      description: 'Team collaboration tools with live chat and document sharing',
      icon: Users,
      color: 'text-green-500',
      badge: 'Live'
    },
    {
      id: 'analytics',
      title: 'Enterprise Analytics',
      description: 'Comprehensive business intelligence and predictive analytics',
      icon: BarChart3,
      color: 'text-purple-500',
      badge: 'Enterprise'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-700 to-gray-800">
      <SEO 
        title="Advanced Features"
        description="Explore Alabama AI Connect's advanced features including AI agent management, real-time collaboration, and enterprise analytics."
      />
      
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/')}
              className="text-gray-300 hover:text-white"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Home
            </Button>
            <div>
              <h1 className="text-4xl font-bold text-white flex items-center gap-3">
                <Sparkles className="w-10 h-10 text-[#00C2FF]" />
                Advanced Features
              </h1>
              <p className="text-xl text-gray-300 mt-2">
                Enterprise-grade tools for modern business intelligence
              </p>
            </div>
          </div>
        </div>

        {/* Feature Overview */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {features.map((feature) => (
            <Card key={feature.id} className="bg-gray-800 border-gray-700 hover:border-gray-600 transition-colors">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <feature.icon className={`w-8 h-8 ${feature.color}`} />
                  <Badge variant="secondary">{feature.badge}</Badge>
                </div>
                <CardTitle className="text-white">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content */}
        <Tabs defaultValue="agents" className="space-y-6">
          <TabsList className="bg-gray-800 border-gray-700 grid grid-cols-3 w-full">
            <TabsTrigger value="agents" className="flex items-center gap-2">
              <Bot className="w-4 h-4" />
              AI Agents
            </TabsTrigger>
            <TabsTrigger value="collaboration" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Collaboration
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="agents" className="space-y-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Bot className="w-6 h-6 text-blue-500" />
                  AI Agent Management Center
                </CardTitle>
                <p className="text-gray-400">
                  Monitor and manage your AI agents with real-time performance metrics, 
                  task distribution, and health monitoring.
                </p>
              </CardHeader>
              <CardContent>
                <AdvancedAgentManager />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="collaboration" className="space-y-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Users className="w-6 h-6 text-green-500" />
                  Real-time Collaboration Hub
                </CardTitle>
                <p className="text-gray-400">
                  Connect with your team in real-time through integrated chat, 
                  document collaboration, and live sessions.
                </p>
              </CardHeader>
              <CardContent>
                <RealtimeCollaborationHub />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <BarChart3 className="w-6 h-6 text-purple-500" />
                  Enterprise Analytics Dashboard
                </CardTitle>
                <p className="text-gray-400">
                  Comprehensive business intelligence with predictive analytics, 
                  performance monitoring, and AI-generated insights.
                </p>
              </CardHeader>
              <CardContent>
                <EnterpriseAnalyticsDashboard />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Call to Action */}
        <Card className="mt-12 bg-gradient-to-r from-[#00C2FF]/10 to-purple-600/10 border-[#00C2FF]/30">
          <CardContent className="p-8 text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <Zap className="w-8 h-8 text-[#00C2FF]" />
              <Brain className="w-8 h-8 text-purple-500" />
              <Globe className="w-8 h-8 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Ready for Enterprise-Grade Intelligence?
            </h2>
            <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
              Unlock the full potential of Alabama's business ecosystem with our advanced 
              AI-powered tools and real-time collaboration features.
            </p>
            <div className="flex items-center justify-center space-x-4">
              <Button 
                onClick={() => navigate('/enterprise')}
                className="bg-[#00C2FF] hover:bg-[#00A8D8]"
              >
                Explore Enterprise
              </Button>
              <Button 
                variant="outline"
                onClick={() => navigate('/contact')}
                className="border-gray-600 text-gray-300 hover:text-white"
              >
                Contact Sales
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdvancedFeatures;
