
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AgentChat } from '@/components/ai/AgentChat';
import { BusinessSearch } from '@/components/ai/BusinessSearch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function AIAgentsPage() {
  return (
    <div className="container py-8 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">AI Agents</h1>
        <p className="text-muted-foreground">
          Interact with our AI agents to find, analyze, and enrich business information.
        </p>
      </div>
      
      <Tabs defaultValue="search" className="w-full">
        <TabsList className="grid w-full grid-cols-5 mb-6">
          <TabsTrigger value="search">Business Search</TabsTrigger>
          <TabsTrigger value="general">General Assistant</TabsTrigger>
          <TabsTrigger value="connector">Business Connector</TabsTrigger>
          <TabsTrigger value="analyst">Market Analyst</TabsTrigger>
          <TabsTrigger value="curator">Data Curator</TabsTrigger>
        </TabsList>
        
        <TabsContent value="search" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Semantic Business Search</CardTitle>
              <CardDescription>
                Find businesses using natural language understanding. Our AI will match your query with the most relevant businesses.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BusinessSearch />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>General Assistant</CardTitle>
              <CardDescription>
                Ask general questions and get helpful responses from our AI assistant.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AgentChat agentType="general" />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="connector" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Business Connector</CardTitle>
              <CardDescription>
                Find and connect with relevant businesses. Our connector agent understands business relationships and can help you discover potential partners, clients, or service providers.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AgentChat agentType="connector" />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="analyst" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Market Analyst</CardTitle>
              <CardDescription>
                Get insights on market trends, competitive analysis, and industry research.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AgentChat agentType="analyst" />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="curator" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Data Curator</CardTitle>
              <CardDescription>
                Enhance and validate business data. Our curator agent can help keep your business information up-to-date and accurate.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AgentChat agentType="curator" />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
