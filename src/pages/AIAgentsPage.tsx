
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  Bot, 
  Brain, 
  FileText, 
  Database, 
  MessageSquare,
  Activity,
  TrendingUp,
  Users,
  Zap,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import Header from '@/components/sections/Header';
import { AgentChat } from '@/components/ai/AgentChat';
import { BusinessSearch } from '@/components/ai/BusinessSearch';
import BamaBot from '@/components/ai/BamaBot';
import TheCurator from '@/components/ai/TheCurator';
import TheScribe from '@/components/ai/TheScribe';
import { useAgent } from '@/hooks/useAgent';

const AIAgentsPage: React.FC = () => {
  const { response: systemStatus } = useAgent('general', {
    autoFetch: true,
    initialQuery: 'Get system status'
  });

  const agents = [
    {
      id: 'bamabot',
      name: 'BamaBot',
      description: 'Your personal AI assistant for Alabama\'s AI ecosystem',
      icon: Bot,
      status: 'active',
      color: 'bg-blue-500',
      interactions: 1247,
      lastActive: '2 minutes ago'
    },
    {
      id: 'connector',
      name: 'Business Connector',
      description: 'Find and connect with relevant businesses',
      icon: Users,
      status: 'active',
      color: 'bg-green-500',
      interactions: 856,
      lastActive: '5 minutes ago'
    },
    {
      id: 'analyst',
      name: 'Market Analyst',
      description: 'Generate market insights and competitive analysis',
      icon: TrendingUp,
      status: 'active',
      color: 'bg-purple-500',
      interactions: 432,
      lastActive: '1 hour ago'
    },
    {
      id: 'curator',
      name: 'The Curator',
      description: 'Data ingestion and verification specialist',
      icon: Database,
      status: 'active',
      color: 'bg-orange-500',
      interactions: 289,
      lastActive: '30 minutes ago'
    },
    {
      id: 'scribe',
      name: 'The Scribe',
      description: 'AI content and storytelling agent',
      icon: FileText,
      status: 'active',
      color: 'bg-indigo-500',
      interactions: 156,
      lastActive: '15 minutes ago'
    }
  ];

  const getStatusIcon = (status: string) => {
    return status === 'active' ? (
      <CheckCircle className="w-4 h-4 text-green-400" />
    ) : (
      <AlertCircle className="w-4 h-4 text-red-400" />
    );
  };

  const getStatusColor = (status: string) => {
    return status === 'active' ? 'bg-green-400' : 'bg-red-400';
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header />
      
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Page Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-3">
            <Brain className="w-12 h-12 text-[#00C2FF]" />
            <h1 className="text-4xl font-bold">AI Agents Dashboard</h1>
          </div>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Meet your intelligent assistants for navigating Alabama's AI ecosystem. 
            Each agent specializes in different aspects of business discovery, analysis, and content creation.
          </p>
        </div>

        {/* System Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-300">Active Agents</CardTitle>
                <Activity className="w-4 h-4 text-green-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{agents.length}</div>
              <p className="text-xs text-gray-400">All systems operational</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-300">Total Interactions</CardTitle>
                <MessageSquare className="w-4 h-4 text-blue-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {agents.reduce((sum, agent) => sum + agent.interactions, 0).toLocaleString()}
              </div>
              <p className="text-xs text-gray-400">This month</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-300">Response Time</CardTitle>
                <Zap className="w-4 h-4 text-yellow-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">1.2s</div>
              <p className="text-xs text-gray-400">Average response</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-300">System Health</CardTitle>
                <CheckCircle className="w-4 h-4 text-green-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400">100%</div>
              <p className="text-xs text-gray-400">Uptime</p>
            </CardContent>
          </Card>
        </div>

        {/* Agent Status Cards */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Agent Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {agents.map((agent) => (
              <Card key={agent.id} className="bg-gray-800 border-gray-700 hover:border-gray-600 transition-colors">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${agent.color}/20`}>
                        <agent.icon className={`w-6 h-6 text-white`} />
                      </div>
                      <div>
                        <CardTitle className="text-white">{agent.name}</CardTitle>
                        <p className="text-sm text-gray-400">{agent.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(agent.status)}
                      <div className={`w-2 h-2 rounded-full ${getStatusColor(agent.status)}`} />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Interactions:</span>
                      <span className="text-white">{agent.interactions.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Last Active:</span>
                      <span className="text-white">{agent.lastActive}</span>
                    </div>
                    <Badge variant={agent.status === 'active' ? 'default' : 'destructive'} className="w-full justify-center">
                      {agent.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Interactive Agent Interface */}
        <Tabs defaultValue="search" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-gray-800 border-gray-700">
            <TabsTrigger value="search" className="data-[state=active]:bg-gray-700">Business Search</TabsTrigger>
            <TabsTrigger value="general" className="data-[state=active]:bg-gray-700">General Assistant</TabsTrigger>
            <TabsTrigger value="connector" className="data-[state=active]:bg-gray-700">Business Connector</TabsTrigger>
            <TabsTrigger value="analyst" className="data-[state=active]:bg-gray-700">Market Analyst</TabsTrigger>
            <TabsTrigger value="curator" className="data-[state=active]:bg-gray-700">Data Curator</TabsTrigger>
          </TabsList>
          
          <TabsContent value="search" className="space-y-4">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Brain className="w-5 h-5 text-[#00C2FF]" />
                  <span>Semantic Business Search</span>
                </CardTitle>
                <p className="text-gray-400">
                  Find businesses using natural language understanding. Our AI will match your query with the most relevant businesses.
                </p>
              </CardHeader>
              <CardContent>
                <BusinessSearch />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="general" className="space-y-4">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bot className="w-5 h-5 text-blue-400" />
                  <span>General Assistant</span>
                </CardTitle>
                <p className="text-gray-400">
                  Ask general questions and get helpful responses from our AI assistant.
                </p>
              </CardHeader>
              <CardContent>
                <AgentChat agentType="general" />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="connector" className="space-y-4">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-green-400" />
                  <span>Business Connector</span>
                </CardTitle>
                <p className="text-gray-400">
                  Find and connect with relevant businesses. Our connector agent understands business relationships and can help you discover potential partners, clients, or service providers.
                </p>
              </CardHeader>
              <CardContent>
                <AgentChat agentType="connector" />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="analyst" className="space-y-4">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-purple-400" />
                  <span>Market Analyst</span>
                </CardTitle>
                <p className="text-gray-400">
                  Get insights on market trends, competitive analysis, and industry research.
                </p>
              </CardHeader>
              <CardContent>
                <AgentChat agentType="analyst" />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="curator" className="space-y-4">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Database className="w-5 h-5 text-orange-400" />
                  <span>Data Curator</span>
                </CardTitle>
                <p className="text-gray-400">
                  Enhance and validate business data. Our curator agent can help keep your business information up-to-date and accurate.
                </p>
              </CardHeader>
              <CardContent>
                <AgentChat agentType="curator" />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Specialized Agent Tools */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Specialized Agent Tools</h2>
          
          <Tabs defaultValue="curator-tools" className="space-y-6">
            <TabsList className="bg-gray-800 border-gray-700">
              <TabsTrigger value="curator-tools" className="data-[state=active]:bg-gray-700">Curator Tools</TabsTrigger>
              <TabsTrigger value="scribe-tools" className="data-[state=active]:bg-gray-700">Scribe Tools</TabsTrigger>
            </TabsList>
            
            <TabsContent value="curator-tools">
              <TheCurator />
            </TabsContent>
            
            <TabsContent value="scribe-tools">
              <TheScribe />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* BamaBot Integration */}
      <BamaBot />
    </div>
  );
};

export { AIAgentsPage };
