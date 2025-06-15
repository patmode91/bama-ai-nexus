
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Code, Send, Clock, CheckCircle, XCircle, Globe } from 'lucide-react';
import { toast } from 'sonner';

interface WebhookTest {
  id: string;
  url: string;
  method: string;
  payload: string;
  status: 'pending' | 'success' | 'error';
  response: string;
  timestamp: string;
  duration: number;
}

const WebhookTester = () => {
  const [testUrl, setTestUrl] = useState('');
  const [testMethod, setTestMethod] = useState('POST');
  const [testPayload, setTestPayload] = useState('{\n  "event": "test",\n  "data": {\n    "businessId": "123",\n    "timestamp": "2024-01-01T00:00:00Z"\n  }\n}');
  const [testHeaders, setTestHeaders] = useState('{\n  "Content-Type": "application/json",\n  "Authorization": "Bearer your_token_here"\n}');
  const [isLoading, setIsLoading] = useState(false);
  const [testHistory, setTestHistory] = useState<WebhookTest[]>([]);

  const runWebhookTest = async () => {
    if (!testUrl) {
      toast.error('Please enter a webhook URL');
      return;
    }

    setIsLoading(true);
    const startTime = Date.now();

    try {
      let headers: Record<string, string> = {};
      try {
        headers = JSON.parse(testHeaders);
      } catch (e) {
        headers = { 'Content-Type': 'application/json' };
      }

      const response = await fetch(testUrl, {
        method: testMethod,
        headers,
        body: testMethod !== 'GET' ? testPayload : undefined,
        mode: 'no-cors'
      });

      const duration = Date.now() - startTime;
      const newTest: WebhookTest = {
        id: Date.now().toString(),
        url: testUrl,
        method: testMethod,
        payload: testPayload,
        status: 'success',
        response: 'Request sent successfully (CORS blocked response)',
        timestamp: new Date().toISOString(),
        duration
      };

      setTestHistory(prev => [newTest, ...prev]);
      toast.success(`Webhook test completed in ${duration}ms`);
    } catch (error) {
      const duration = Date.now() - startTime;
      const newTest: WebhookTest = {
        id: Date.now().toString(),
        url: testUrl,
        method: testMethod,
        payload: testPayload,
        status: 'error',
        response: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
        duration
      };

      setTestHistory(prev => [newTest, ...prev]);
      toast.error('Webhook test failed');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gray-900/80 backdrop-blur-sm border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Globe className="w-5 h-5" />
            <span>Webhook Tester</span>
          </CardTitle>
          <CardDescription>
            Test your webhooks and integrations before going live
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="request" className="space-y-4">
            <TabsList className="bg-gray-800">
              <TabsTrigger value="request">Request</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>

            <TabsContent value="request" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-1">
                  <Label htmlFor="method">Method</Label>
                  <Select value={testMethod} onValueChange={setTestMethod}>
                    <SelectTrigger className="bg-gray-800 border-gray-600">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="POST">POST</SelectItem>
                      <SelectItem value="GET">GET</SelectItem>
                      <SelectItem value="PUT">PUT</SelectItem>
                      <SelectItem value="DELETE">DELETE</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="md:col-span-3">
                  <Label htmlFor="url">Webhook URL</Label>
                  <Input
                    id="url"
                    placeholder="https://your-webhook-endpoint.com/webhook"
                    value={testUrl}
                    onChange={(e) => setTestUrl(e.target.value)}
                    className="bg-gray-800 border-gray-600"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="headers">Headers (JSON)</Label>
                <Textarea
                  id="headers"
                  placeholder="Enter request headers as JSON"
                  value={testHeaders}
                  onChange={(e) => setTestHeaders(e.target.value)}
                  className="bg-gray-800 border-gray-600 min-h-[100px] font-mono text-sm"
                />
              </div>

              {testMethod !== 'GET' && (
                <div>
                  <Label htmlFor="payload">Request Payload (JSON)</Label>
                  <Textarea
                    id="payload"
                    placeholder="Enter request payload as JSON"
                    value={testPayload}
                    onChange={(e) => setTestPayload(e.target.value)}
                    className="bg-gray-800 border-gray-600 min-h-[150px] font-mono text-sm"
                  />
                </div>
              )}

              <Button onClick={runWebhookTest} disabled={isLoading} className="w-full">
                <Send className="w-4 h-4 mr-2" />
                {isLoading ? 'Testing...' : 'Send Test Request'}
              </Button>
            </TabsContent>

            <TabsContent value="history" className="space-y-4">
              {testHistory.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <Code className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No webhook tests yet. Run a test to see results here.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {testHistory.map((test) => (
                    <Card key={test.id} className="bg-gray-800/50 border-gray-600">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(test.status)}
                            <Badge variant={test.method === 'POST' ? 'default' : 'secondary'}>
                              {test.method}
                            </Badge>
                            <span className="text-sm font-mono text-gray-300">{test.url}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-gray-400">
                            <Clock className="w-3 h-3" />
                            <span>{test.duration}ms</span>
                            <span>{new Date(test.timestamp).toLocaleTimeString()}</span>
                          </div>
                        </div>
                        
                        <div className="text-sm">
                          <p className="text-gray-400 mb-1">Response:</p>
                          <pre className="bg-gray-900 p-2 rounded text-xs overflow-x-auto">
                            {test.response}
                          </pre>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default WebhookTester;
