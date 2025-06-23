
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Puzzle, 
  Code, 
  Play, 
  Settings, 
  Book,
  Zap,
  CheckCircle,
  XCircle,
  AlertCircle,
  Copy,
  Download
} from 'lucide-react';
import { agentSDK } from '@/services/ai/agentSDK';
import { toast } from 'sonner';

export const SDKDashboard: React.FC = () => {
  const [agents, setAgents] = useState<any[]>([]);
  const [sdkStats, setSdkStats] = useState<any>({});
  const [selectedAgent, setSelectedAgent] = useState<any>(null);
  const [testParams, setTestParams] = useState<string>('{}');
  const [testResult, setTestResult] = useState<any>(null);
  const [isExecuting, setIsExecuting] = useState(false);

  useEffect(() => {
    const loadData = () => {
      setAgents(agentSDK.listAgents());
      setSdkStats(agentSDK.getSDKStats());
    };

    loadData();
  }, []);

  const handleExecuteAgent = async () => {
    if (!selectedAgent) return;

    setIsExecuting(true);
    setTestResult(null);

    try {
      const params = JSON.parse(testParams);
      const result = await agentSDK.executeAgent(
        selectedAgent.id,
        selectedAgent.endpoints[0]?.path || '/test',
        params,
        { useCache: true }
      );
      
      setTestResult(result);
      toast.success('Agent executed successfully');
    } catch (error) {
      const errorResult = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        metadata: {
          requestId: 'error',
          timestamp: new Date().toISOString(),
          executionTime: 0
        }
      };
      setTestResult(errorResult);
      toast.error('Agent execution failed');
    } finally {
      setIsExecuting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const generateDocumentation = (agentId: string) => {
    try {
      const docs = agentSDK.generateDocumentation(agentId);
      const blob = new Blob([docs], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${agentId}-documentation.md`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success('Documentation downloaded');
    } catch (error) {
      toast.error('Failed to generate documentation');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'inactive': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'deprecated': return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Agent SDK Dashboard</h1>
            <p className="text-gray-400">Third-party integration framework and agent management</p>
          </div>
          <Button className="bg-[#00C2FF] hover:bg-[#00A8D8]">
            <Code className="w-4 h-4 mr-2" />
            Register New Agent
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Agents</p>
                  <p className="text-2xl font-bold text-white">{sdkStats.totalAgents || 0}</p>
                </div>
                <div className="bg-[#00C2FF]/20 p-3 rounded-lg">
                  <Puzzle className="w-6 h-6 text-[#00C2FF]" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Active Agents</p>
                  <p className="text-2xl font-bold text-white">{sdkStats.activeAgents || 0}</p>
                </div>
                <div className="bg-green-500/20 p-3 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Integrations</p>
                  <p className="text-2xl font-bold text-white">{sdkStats.totalIntegrations || 0}</p>
                </div>
                <div className="bg-purple-500/20 p-3 rounded-lg">
                  <Settings className="w-6 h-6 text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Cache Size</p>
                  <p className="text-2xl font-bold text-white">{sdkStats.cacheSize || 0}</p>
                </div>
                <div className="bg-orange-500/20 p-3 rounded-lg">
                  <Zap className="w-6 h-6 text-orange-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="agents" className="space-y-6">
          <TabsList className="bg-gray-800 w-full">
            <TabsTrigger value="agents" className="flex-1">Registered Agents</TabsTrigger>
            <TabsTrigger value="playground" className="flex-1">API Playground</TabsTrigger>
            <TabsTrigger value="documentation" className="flex-1">Documentation</TabsTrigger>
          </TabsList>

          <TabsContent value="agents" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {agents.map((agent) => (
                <Card key={agent.id} className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-white text-lg">{agent.name}</CardTitle>
                      {getStatusIcon(agent.status)}
                    </div>
                    <p className="text-gray-400 text-sm">{agent.description}</p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm">Version</span>
                      <Badge variant="outline">{agent.version}</Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <span className="text-gray-400 text-sm">Capabilities</span>
                      <div className="flex flex-wrap gap-1">
                        {agent.capabilities.slice(0, 3).map((cap: string) => (
                          <Badge key={cap} variant="secondary" className="text-xs">
                            {cap}
                          </Badge>
                        ))}
                        {agent.capabilities.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{agent.capabilities.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <span className="text-gray-400 text-sm">Endpoints</span>
                      <div className="text-white text-sm">{agent.endpoints.length} endpoints</div>
                    </div>

                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        className="flex-1 bg-[#00C2FF] hover:bg-[#00A8D8]"
                        onClick={() => setSelectedAgent(agent)}
                      >
                        <Play className="w-3 h-3 mr-1" />
                        Test
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => generateDocumentation(agent.id)}
                      >
                        <Download className="w-3 h-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="playground" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">API Testing</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">Select Agent</label>
                    <select 
                      className="w-full bg-gray-700 border border-gray-600 text-white p-2 rounded"
                      value={selectedAgent?.id || ''}
                      onChange={(e) => {
                        const agent = agents.find(a => a.id === e.target.value);
                        setSelectedAgent(agent);
                      }}
                    >
                      <option value="">Choose an agent...</option>
                      {agents.map(agent => (
                        <option key={agent.id} value={agent.id}>{agent.name}</option>
                      ))}
                    </select>
                  </div>

                  {selectedAgent && (
                    <div>
                      <label className="text-sm text-gray-400 mb-2 block">Endpoint</label>
                      <select className="w-full bg-gray-700 border border-gray-600 text-white p-2 rounded">
                        {selectedAgent.endpoints.map((endpoint: any) => (
                          <option key={endpoint.path} value={endpoint.path}>
                            {endpoint.method} {endpoint.path}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">Parameters (JSON)</label>
                    <Textarea
                      value={testParams}
                      onChange={(e) => setTestParams(e.target.value)}
                      className="bg-gray-700 border-gray-600 text-white font-mono text-sm"
                      rows={6}
                      placeholder='{"query": "AI companies in Alabama"}'
                    />
                  </div>

                  <Button 
                    className="w-full bg-[#00C2FF] hover:bg-[#00A8D8]"
                    onClick={handleExecuteAgent}
                    disabled={!selectedAgent || isExecuting}
                  >
                    {isExecuting ? (
                      <>
                        <Zap className="w-4 h-4 mr-2 animate-spin" />
                        Executing...
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        Execute Agent
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white">Response</CardTitle>
                    {testResult && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => copyToClipboard(JSON.stringify(testResult, null, 2))}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {testResult ? (
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        {testResult.success ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-500" />
                        )}
                        <span className={testResult.success ? 'text-green-400' : 'text-red-400'}>
                          {testResult.success ? 'Success' : 'Error'}
                        </span>
                      </div>

                      {testResult.metadata && (
                        <div className="text-xs text-gray-400 space-y-1">
                          <div>Request ID: {testResult.metadata.requestId}</div>
                          <div>Execution Time: {testResult.metadata.executionTime}ms</div>
                          <div>Timestamp: {testResult.metadata.timestamp}</div>
                        </div>
                      )}

                      <pre className="bg-gray-900 p-4 rounded text-xs text-gray-300 overflow-auto max-h-96">
                        {JSON.stringify(testResult, null, 2)}
                      </pre>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-400">
                      <Code className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Execute an agent to see the response</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="documentation" className="space-y-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">SDK Documentation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="prose prose-invert max-w-none">
                  <h3 className="text-white">Getting Started</h3>
                  <p className="text-gray-300">
                    The BAMA AI Agent SDK provides a unified interface for integrating with various AI agents
                    and third-party services. Use the SDK to build powerful AI-driven applications.
                  </p>
                  
                  <h4 className="text-white">Basic Usage</h4>
                  <pre className="bg-gray-900 p-4 rounded text-sm text-gray-300 overflow-x-auto">
{`import { agentSDK } from '@/services/ai/agentSDK';

// Execute an agent
const result = await agentSDK.executeAgent(
  'bama-connector',
  '/find-matches',
  { query: 'AI companies', limit: 10 }
);

console.log(result.data);`}
                  </pre>

                  <h4 className="text-white">Supported Auth Types</h4>
                  <ul className="text-gray-300 space-y-1">
                    {sdkStats.supportedAuthTypes?.map((type: string) => (
                      <li key={type}>• {type}</li>
                    ))}
                  </ul>
                </div>

                <div className="flex space-x-4">
                  <Button className="bg-[#00C2FF] hover:bg-[#00A8D8]">
                    <Book className="w-4 h-4 mr-2" />
                    View Full Documentation
                  </Button>
                  <Button variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Download SDK
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SDKDashboard;
