
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Code, Copy, Book, ExternalLink, Download } from 'lucide-react';
import { toast } from 'sonner';

const APIDocumentation = () => {
  const [selectedEndpoint, setSelectedEndpoint] = useState('get-profile');

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const endpoints = [
    {
      id: 'get-profile',
      method: 'GET',
      path: '/api/business/profile',
      description: 'Get business profile information',
      auth: true,
      parameters: [],
      response: {
        id: 123,
        businessname: 'Example Business',
        category: 'Technology',
        location: 'Birmingham, AL',
        rating: 4.5,
        verified: true
      }
    },
    {
      id: 'update-profile',
      method: 'PUT',
      path: '/api/business/profile',
      description: 'Update business profile',
      auth: true,
      parameters: [
        { name: 'businessname', type: 'string', required: true },
        { name: 'description', type: 'string', required: false },
        { name: 'location', type: 'string', required: false }
      ],
      response: {
        success: true,
        message: 'Profile updated successfully'
      }
    },
    {
      id: 'get-reviews',
      method: 'GET',
      path: '/api/business/reviews',
      description: 'Get business reviews',
      auth: true,
      parameters: [
        { name: 'limit', type: 'number', required: false, default: 10 },
        { name: 'offset', type: 'number', required: false, default: 0 }
      ],
      response: {
        reviews: [
          {
            id: 'uuid',
            rating: 5,
            title: 'Great service!',
            comment: 'Excellent experience',
            created_at: '2024-01-01T00:00:00Z'
          }
        ],
        total: 25
      }
    },
    {
      id: 'webhook-events',
      method: 'POST',
      path: '/webhook',
      description: 'Webhook endpoint for receiving events',
      auth: false,
      parameters: [],
      response: {
        event: 'new_review',
        data: {
          businessId: 123,
          reviewId: 'uuid',
          rating: 5
        },
        timestamp: '2024-01-01T00:00:00Z'
      }
    }
  ];

  const webhookEvents = [
    {
      event: 'new_contact',
      description: 'Triggered when someone submits a contact form',
      payload: {
        event: 'new_contact',
        data: {
          businessId: 123,
          name: 'John Doe',
          email: 'john@example.com',
          message: 'Interested in your services'
        }
      }
    },
    {
      event: 'new_review',
      description: 'Triggered when a new review is posted',
      payload: {
        event: 'new_review',
        data: {
          businessId: 123,
          reviewId: 'uuid',
          rating: 5,
          title: 'Great service!',
          comment: 'Excellent experience'
        }
      }
    },
    {
      event: 'profile_update',
      description: 'Triggered when business profile is updated',
      payload: {
        event: 'profile_update',
        data: {
          businessId: 123,
          changes: ['description', 'location'],
          updatedAt: '2024-01-01T00:00:00Z'
        }
      }
    },
    {
      event: 'verification_status',
      description: 'Triggered when verification status changes',
      payload: {
        event: 'verification_status',
        data: {
          businessId: 123,
          verified: true,
          verifiedAt: '2024-01-01T00:00:00Z'
        }
      }
    }
  ];

  const codeExamples = {
    javascript: `// Using fetch API
const response = await fetch('https://api.alabama-ai.com/api/business/profile', {
  headers: {
    'Authorization': 'Bearer your_api_key_here',
    'Content-Type': 'application/json'
  }
});

const data = await response.json();
console.log(data);`,
    
    python: `import requests

headers = {
    'Authorization': 'Bearer your_api_key_here',
    'Content-Type': 'application/json'
}

response = requests.get(
    'https://api.alabama-ai.com/api/business/profile',
    headers=headers
)

data = response.json()
print(data)`,

    curl: `curl -X GET "https://api.alabama-ai.com/api/business/profile" \\
  -H "Authorization: Bearer your_api_key_here" \\
  -H "Content-Type: application/json"`
  };

  const selectedEndpointData = endpoints.find(e => e.id === selectedEndpoint);

  return (
    <div className="space-y-6">
      <Card className="bg-gray-900/80 backdrop-blur-sm border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Book className="w-5 h-5" />
            <span>API Documentation</span>
          </CardTitle>
          <CardDescription>
            Complete API reference for Alabama AI Directory integration
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="endpoints" className="space-y-4">
            <TabsList className="bg-gray-800">
              <TabsTrigger value="endpoints">API Endpoints</TabsTrigger>
              <TabsTrigger value="webhooks">Webhook Events</TabsTrigger>
              <TabsTrigger value="examples">Code Examples</TabsTrigger>
              <TabsTrigger value="postman">Postman Collection</TabsTrigger>
            </TabsList>

            <TabsContent value="endpoints" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold mb-3">Endpoints</h3>
                  {endpoints.map((endpoint) => (
                    <Card 
                      key={endpoint.id}
                      className={`cursor-pointer transition-colors ${
                        selectedEndpoint === endpoint.id 
                          ? 'bg-blue-600/20 border-blue-500' 
                          : 'bg-gray-800/50 border-gray-600 hover:bg-gray-700/50'
                      }`}
                      onClick={() => setSelectedEndpoint(endpoint.id)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between mb-1">
                          <Badge variant={endpoint.method === 'GET' ? 'secondary' : 'default'}>
                            {endpoint.method}
                          </Badge>
                          {endpoint.auth && (
                            <Badge variant="outline" className="text-xs">Auth</Badge>
                          )}
                        </div>
                        <code className="text-sm text-blue-400">{endpoint.path}</code>
                        <p className="text-xs text-gray-400 mt-1">{endpoint.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="lg:col-span-2">
                  {selectedEndpointData && (
                    <Card className="bg-gray-800/50 border-gray-600">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="flex items-center space-x-2">
                            <Badge variant={selectedEndpointData.method === 'GET' ? 'secondary' : 'default'}>
                              {selectedEndpointData.method}
                            </Badge>
                            <code className="text-blue-400">{selectedEndpointData.path}</code>
                          </CardTitle>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyToClipboard(`${selectedEndpointData.method} ${selectedEndpointData.path}`)}
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                        <CardDescription>{selectedEndpointData.description}</CardDescription>
                      </CardHeader>
                      
                      <CardContent className="space-y-4">
                        {selectedEndpointData.auth && (
                          <div>
                            <h4 className="font-medium mb-2">Authentication</h4>
                            <code className="bg-gray-900 p-2 rounded block text-sm">
                              Authorization: Bearer your_api_key_here
                            </code>
                          </div>
                        )}

                        {selectedEndpointData.parameters.length > 0 && (
                          <div>
                            <h4 className="font-medium mb-2">Parameters</h4>
                            <div className="space-y-2">
                              {selectedEndpointData.parameters.map((param, index) => (
                                <div key={index} className="flex items-center justify-between p-2 bg-gray-900 rounded">
                                  <div>
                                    <code className="text-blue-400">{param.name}</code>
                                    <Badge variant="outline" className="ml-2 text-xs">
                                      {param.type}
                                    </Badge>
                                    {param.required && (
                                      <Badge variant="destructive" className="ml-1 text-xs">
                                        Required
                                      </Badge>
                                    )}
                                  </div>
                                  {param.default && (
                                    <span className="text-xs text-gray-400">
                                      Default: {param.default}
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">Response Example</h4>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copyToClipboard(JSON.stringify(selectedEndpointData.response, null, 2))}
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                          </div>
                          <pre className="bg-gray-900 p-3 rounded text-sm overflow-x-auto">
                            {JSON.stringify(selectedEndpointData.response, null, 2)}
                          </pre>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="webhooks" className="space-y-4">
              <div className="space-y-4">
                {webhookEvents.map((event, index) => (
                  <Card key={index} className="bg-gray-800/50 border-gray-600">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center space-x-2">
                          <Badge variant="default">{event.event}</Badge>
                        </CardTitle>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(JSON.stringify(event.payload, null, 2))}
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                      <CardDescription>{event.description}</CardDescription>
                    </CardHeader>
                    
                    <CardContent>
                      <h4 className="font-medium mb-2">Payload Example</h4>
                      <pre className="bg-gray-900 p-3 rounded text-sm overflow-x-auto">
                        {JSON.stringify(event.payload, null, 2)}
                      </pre>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="examples" className="space-y-4">
              <Tabs defaultValue="javascript" className="space-y-4">
                <TabsList className="bg-gray-800">
                  <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                  <TabsTrigger value="python">Python</TabsTrigger>
                  <TabsTrigger value="curl">cURL</TabsTrigger>
                </TabsList>

                {Object.entries(codeExamples).map(([lang, code]) => (
                  <TabsContent key={lang} value={lang}>
                    <Card className="bg-gray-800/50 border-gray-600">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="capitalize">{lang} Example</CardTitle>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyToClipboard(code)}
                          >
                            <Copy className="w-3 h-3 mr-1" />
                            Copy
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <pre className="bg-gray-900 p-4 rounded text-sm overflow-x-auto">
                          <code>{code}</code>
                        </pre>
                      </CardContent>
                    </Card>
                  </TabsContent>
                ))}
              </Tabs>
            </TabsContent>

            <TabsContent value="postman" className="space-y-4">
              <Card className="bg-gray-800/50 border-gray-600">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Download className="w-5 h-5" />
                    <span>Postman Collection</span>
                  </CardTitle>
                  <CardDescription>
                    Import our Postman collection to quickly test API endpoints
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-900 rounded">
                    <div>
                      <h4 className="font-medium">Alabama AI Directory API</h4>
                      <p className="text-sm text-gray-400">Complete collection with all endpoints and examples</p>
                    </div>
                    <Button variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      Download Collection
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium">What's included:</h4>
                    <ul className="text-sm text-gray-400 space-y-1">
                      <li>• All API endpoints with example requests</li>
                      <li>• Environment variables for easy configuration</li>
                      <li>• Authentication setup</li>
                      <li>• Response examples and schemas</li>
                    </ul>
                  </div>

                  <div className="border-t border-gray-600 pt-4">
                    <h4 className="font-medium mb-2">How to use:</h4>
                    <ol className="text-sm text-gray-400 space-y-1">
                      <li>1. Download the collection file</li>
                      <li>2. Import into Postman</li>
                      <li>3. Set your API key in the environment variables</li>
                      <li>4. Start testing endpoints</li>
                    </ol>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default APIDocumentation;
