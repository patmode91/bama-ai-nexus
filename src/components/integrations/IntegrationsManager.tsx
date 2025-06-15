
import { useState } from 'react';
import { Integration } from '@/types/integrations';
import { useIntegrations } from '@/hooks/useIntegrations';
import IntegrationCard from './IntegrationCard';
import IntegrationConfig from './IntegrationConfig';
import WebhookTester from './WebhookTester';
import APIDocumentation from './APIDocumentation';
import IntegrationMarketplace from './IntegrationMarketplace';
import IntegrationAnalytics from './IntegrationAnalytics';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Plug, Activity, Code, Zap, Store, TestTube } from 'lucide-react';

const IntegrationsManager = () => {
  const {
    integrations,
    events,
    isLoading,
    updateIntegration,
    toggleIntegration,
    testIntegration,
    generateApiKey
  } = useIntegrations();

  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  const handleConfigure = (integration: Integration) => {
    setSelectedIntegration(integration);
    setIsConfigOpen(true);
  };

  const handleCloseConfig = () => {
    setIsConfigOpen(false);
    setSelectedIntegration(null);
  };

  const activeIntegrationsCount = integrations.filter(i => i.isActive).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center space-x-2">
            <Plug className="w-8 h-8" />
            <span>Integrations Hub</span>
          </h1>
          <p className="text-gray-400 mt-2">
            Connect your business with external tools and services
          </p>
        </div>
        <Badge variant="outline" className="text-lg px-3 py-1">
          {activeIntegrationsCount} Active
        </Badge>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gray-900/80 backdrop-blur-sm border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Integrations</CardTitle>
            <Plug className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{integrations.length}</div>
            <p className="text-xs text-muted-foreground">
              {activeIntegrationsCount} active
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/80 backdrop-blur-sm border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Events This Month</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{events.length}</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/80 backdrop-blur-sm border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">API Calls</CardTitle>
            <Code className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="integrations" className="space-y-4">
        <TabsList className="bg-gray-800 border-gray-700">
          <TabsTrigger value="integrations">
            <Zap className="w-4 h-4 mr-2" />
            My Integrations
          </TabsTrigger>
          <TabsTrigger value="marketplace">
            <Store className="w-4 h-4 mr-2" />
            Marketplace
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <Activity className="w-4 h-4 mr-2" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="tester">
            <TestTube className="w-4 h-4 mr-2" />
            Webhook Tester
          </TabsTrigger>
          <TabsTrigger value="documentation">
            <Code className="w-4 h-4 mr-2" />
            API Docs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="integrations" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {integrations.map((integration) => (
              <IntegrationCard
                key={integration.id}
                integration={integration}
                onConfigure={handleConfigure}
                onToggle={toggleIntegration}
                onTest={testIntegration}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="marketplace" className="space-y-4">
          <IntegrationMarketplace />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <IntegrationAnalytics />
        </TabsContent>

        <TabsContent value="tester" className="space-y-4">
          <WebhookTester />
        </TabsContent>

        <TabsContent value="documentation" className="space-y-4">
          <APIDocumentation />
        </TabsContent>
      </Tabs>

      {/* Configuration Modal */}
      <IntegrationConfig
        integration={selectedIntegration}
        isOpen={isConfigOpen}
        onClose={handleCloseConfig}
        onSave={updateIntegration}
        generateApiKey={generateApiKey}
      />
    </div>
  );
};

export default IntegrationsManager;
