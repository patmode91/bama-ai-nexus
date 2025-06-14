
import { useState } from 'react';
import { Integration } from '@/types/integrations';
import { useIntegrations } from '@/hooks/useIntegrations';
import IntegrationCard from './IntegrationCard';
import IntegrationConfig from './IntegrationConfig';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Plug, Activity, Code, Zap } from 'lucide-react';

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
            <span>Integrations</span>
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
          <TabsTrigger value="integrations">Available Integrations</TabsTrigger>
          <TabsTrigger value="events">Event History</TabsTrigger>
          <TabsTrigger value="documentation">API Documentation</TabsTrigger>
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

        <TabsContent value="events" className="space-y-4">
          <Card className="bg-gray-900/80 backdrop-blur-sm border-gray-700">
            <CardHeader>
              <CardTitle>Recent Events</CardTitle>
              <CardDescription>
                History of integration events and webhook deliveries
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-400">
                <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No events yet. Configure and activate integrations to see activity here.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documentation" className="space-y-4">
          <Card className="bg-gray-900/80 backdrop-blur-sm border-gray-700">
            <CardHeader>
              <CardTitle>API Documentation</CardTitle>
              <CardDescription>
                Learn how to integrate with Alabama AI Directory
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="prose prose-invert max-w-none">
                <h3>Authentication</h3>
                <p>Use your API key in the Authorization header:</p>
                <pre className="bg-gray-800 p-3 rounded text-sm overflow-x-auto">
                  <code>Authorization: Bearer your_api_key_here</code>
                </pre>

                <h3>Available Endpoints</h3>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">GET</Badge>
                    <code>/api/business/profile</code>
                    <span className="text-gray-400">- Get business profile</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">PUT</Badge>
                    <code>/api/business/profile</code>
                    <span className="text-gray-400">- Update business profile</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">GET</Badge>
                    <code>/api/business/reviews</code>
                    <span className="text-gray-400">- Get business reviews</span>
                  </div>
                </div>

                <h3>Webhook Events</h3>
                <p>Your webhook endpoint will receive POST requests for these events:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li><code>new_contact</code> - New contact form submission</li>
                  <li><code>new_review</code> - New review posted</li>
                  <li><code>profile_update</code> - Business profile updated</li>
                  <li><code>verification_status</code> - Verification status changed</li>
                </ul>
              </div>
            </CardContent>
          </Card>
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
