
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Bot, 
  Zap, 
  MessageSquare, 
  Search, 
  TrendingUp,
  Database,
  FileText,
  Settings,
  Play,
  Pause,
  RefreshCw
} from 'lucide-react';
import { useAgent } from '@/hooks/useAgent';
import { useToast } from '@/hooks/use-toast';

const AgentIntegrationHub: React.FC = () => {
  const [activeIntegrations, setActiveIntegrations] = useState<string[]>(['search', 'analytics']);
  const [testQuery, setTestQuery] = useState('');
  const [testResults, setTestResults] = useState<any>(null);
  const { toast } = useToast();
  
  const { callAgent: testGeneral, isLoading: generalLoading } = useAgent('general');
  const { callAgent: testConnector, isLoading: connectorLoading } = useAgent('connector');
  const { callAgent: testAnalyst, isLoading: analystLoading } = useAgent('analyst');

  const integrations = [
    {
      id: 'search',
      name: 'Search Integration',
      description: 'Embed AI agents in search results',
      icon: Search,
      status: 'active',
      endpoints: ['/search', '/directory'],
      color: 'text-blue-400'
    },
    {
      id: 'analytics',
      name: 'Analytics Integration',
      description: 'AI-powered insights in analytics dashboard',
      icon: TrendingUp,
      status: 'active',
      endpoints: ['/analytics', '/enterprise-analytics'],
      color: 'text-purple-400'
    },
    {
      id: 'business-profiles',
      name: 'Business Profile Enhancement',
      description: 'AI-generated content for business listings',
      icon: FileText,
      status: 'inactive',
      endpoints: ['/business/:id', '/add-business'],
      color: 'text-green-400'
    },
    {
      id: 'chat-widgets',
      name: 'Chat Widget Integration',
      description: 'Embedded chat agents across pages',
      icon: MessageSquare,
      status: 'active',
      endpoints: ['Global'],
      color: 'text-orange-400'
    }
  ];

  const toggleIntegration = (id: string) => {
    setActiveIntegrations(prev =>
      prev.includes(id)
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
    
    toast({
      title: "Integration Updated",
      description: `${integrations.find(i => i.id === id)?.name} ${
        activeIntegrations.includes(id) ? 'disabled' : 'enabled'
      }`,
    });
  };

  const runAgentTest = async (agentType: 'general' | 'connector' | 'analyst') => {
    if (!testQuery.trim()) {
      toast({
        title: "Error",
        description: "Please enter a test query",
        variant: "destructive",
      });
      return;
    }

    try {
      let result;
      switch (agentType) {
        case 'general':
          result = await testGeneral(testQuery);
          break;
        case 'connector':
          result = await testConnector(testQuery);
          break;
        case 'analyst':
          result = await testAnalyst(testQuery);
          break;
      }
      
      setTestResults({ agent: agentType, query: testQuery, result });
      toast({
        title: "Test Completed",
        description: `${agentType} agent test successful`,
      });
    } catch (error) {
      toast({
        title: "Test Failed",
        description: `${agentType} agent test failed: ${error}`,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Settings className="w-6 h-6 text-[#00C2FF]" />
              <div>
                <CardTitle className="text-white">Agent Integration Hub</CardTitle>
                <p className="text-gray-400 text-sm">Manage AI agent integrations across the platform</p>
              </div>
            </div>
            <Badge variant="outline" className="text-[#00C2FF] border-[#00C2FF]">
              {activeIntegrations.length} Active
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="integrations" className="space-y-4">
            <TabsList className="bg-gray-700 border-gray-600">
              <TabsTrigger value="integrations">Integrations</TabsTrigger>
              <TabsTrigger value="testing">Agent Testing</TabsTrigger>
              <TabsTrigger value="monitoring">Performance</TabsTrigger>
            </TabsList>

            <TabsContent value="integrations" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {integrations.map((integration) => (
                  <Card key={integration.id} className="bg-gray-700 border-gray-600">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <integration.icon className={`w-5 h-5 ${integration.color}`} />
                          <div>
                            <h4 className="font-medium text-white">{integration.name}</h4>
                            <p className="text-sm text-gray-400">{integration.description}</p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant={activeIntegrations.includes(integration.id) ? "default" : "outline"}
                          onClick={() => toggleIntegration(integration.id)}
                        >
                          {activeIntegrations.includes(integration.id) ? (
                            <>
                              <Pause className="w-3 h-3 mr-1" />
                              Disable
                            </>
                          ) : (
                            <>
                              <Play className="w-3 h-3 mr-1" />
                              Enable
                            </>
                          )}
                        </Button>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-400">Status:</span>
                          <Badge variant={activeIntegrations.includes(integration.id) ? "default" : "secondary"}>
                            {activeIntegrations.includes(integration.id) ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                        <div>
                          <span className="text-sm text-gray-400">Endpoints:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {integration.endpoints.map((endpoint, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {endpoint}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="testing" className="space-y-4">
              <Card className="bg-gray-700 border-gray-600">
                <CardHeader>
                  <CardTitle className="text-white">Agent Testing Interface</CardTitle>
                  <p className="text-gray-400">Test agent responses and functionality</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Enter test query..."
                      value={testQuery}
                      onChange={(e) => setTestQuery(e.target.value)}
                      className="bg-gray-800 border-gray-600"
                    />
                    <Button onClick={() => runAgentTest('general')} disabled={generalLoading}>
                      <Bot className="w-4 h-4 mr-2" />
                      General
                    </Button>
                    <Button onClick={() => runAgentTest('connector')} disabled={connectorLoading}>
                      <Search className="w-4 h-4 mr-2" />
                      Connector
                    </Button>
                    <Button onClick={() => runAgentTest('analyst')} disabled={analystLoading}>
                      <TrendingUp className="w-4 h-4 mr-2" />
                      Analyst
                    </Button>
                  </div>
                  
                  {testResults && (
                    <Card className="bg-gray-800 border-gray-600">
                      <CardHeader>
                        <CardTitle className="text-sm flex items-center space-x-2">
                          <Badge>{testResults.agent}</Badge>
                          <span>Test Results</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div>
                            <span className="text-sm text-gray-400">Query:</span>
                            <p className="text-white">{testResults.query}</p>
                          </div>
                          <div>
                            <span className="text-sm text-gray-400">Response:</span>
                            <pre className="text-sm bg-gray-900 p-2 rounded mt-1 text-gray-300 whitespace-pre-wrap">
                              {JSON.stringify(testResults.result, null, 2)}
                            </pre>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="monitoring" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-gray-700 border-gray-600">
                  <CardContent className="p-4 text-center">
                    <Zap className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-white">1.2s</div>
                    <div className="text-sm text-gray-400">Avg Response Time</div>
                  </CardContent>
                </Card>
                
                <Card className="bg-gray-700 border-gray-600">
                  <CardContent className="p-4 text-center">
                    <MessageSquare className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-white">2,847</div>
                    <div className="text-sm text-gray-400">Daily Interactions</div>
                  </CardContent>
                </Card>
                
                <Card className="bg-gray-700 border-gray-600">
                  <CardContent className="p-4 text-center">
                    <RefreshCw className="w-8 h-8 text-green-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-white">99.8%</div>
                    <div className="text-sm text-gray-400">System Uptime</div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default AgentIntegrationHub;
