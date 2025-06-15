
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Settings, 
  Zap, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Plug,
  Webhook,
  Activity,
  RefreshCw,
  TestTube
} from 'lucide-react';
import { enterpriseIntegrationsService } from '@/services/integrations/enterpriseIntegrationsService';

const EnterpriseIntegrationsManager = () => {
  const [integrations, setIntegrations] = useState<any[]>([]);
  const [webhookEvents, setWebhookEvents] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [selectedIntegration, setSelectedIntegration] = useState<any>(null);
  const [configDialog, setConfigDialog] = useState(false);
  const [testingIntegration, setTestingIntegration] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setIntegrations(enterpriseIntegrationsService.getIntegrations());
    setWebhookEvents(enterpriseIntegrationsService.getWebhookEvents());
    setStats(enterpriseIntegrationsService.getIntegrationStats());
  };

  const handleToggleIntegration = async (id: string, enabled: boolean) => {
    if (enabled) {
      await enterpriseIntegrationsService.enableIntegration(id);
    } else {
      await enterpriseIntegrationsService.disableIntegration(id);
    }
    loadData();
  };

  const handleTestIntegration = async (id: string) => {
    setTestingIntegration(id);
    try {
      await enterpriseIntegrationsService.testIntegration(id);
    } finally {
      setTestingIntegration(null);
      loadData();
    }
  };

  const handleSyncIntegration = async (id: string) => {
    await enterpriseIntegrationsService.syncIntegration(id);
    loadData();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-400" />;
      case 'pending':
        return <AlertCircle className="w-4 h-4 text-yellow-400" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-600';
      case 'error':
        return 'bg-red-600';
      case 'pending':
        return 'bg-yellow-600';
      default:
        return 'bg-gray-600';
    }
  };

  const simulateWebhook = () => {
    enterpriseIntegrationsService.processWebhook({
      source: 'demo',
      event: 'test_event',
      data: { message: 'Test webhook event', timestamp: Date.now() }
    });
    loadData();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Enterprise Integrations</h1>
          <p className="text-gray-400 mt-2">Manage your business system integrations</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={loadData}
            variant="outline"
            className="border-gray-600 text-gray-300"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button
            onClick={simulateWebhook}
            variant="outline"
            className="border-gray-600 text-gray-300"
          >
            <Webhook className="w-4 h-4 mr-2" />
            Test Webhook
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Integrations</p>
                  <p className="text-2xl font-bold text-white">{stats.total}</p>
                </div>
                <Plug className="w-8 h-8 text-[#00C2FF]" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Active</p>
                  <p className="text-2xl font-bold text-green-400">{stats.active}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Webhook Events</p>
                  <p className="text-2xl font-bold text-white">{stats.webhookEvents}</p>
                </div>
                <Webhook className="w-8 h-8 text-[#00C2FF]" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Errors</p>
                  <p className="text-2xl font-bold text-red-400">{stats.errors}</p>
                </div>
                <XCircle className="w-8 h-8 text-red-400" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="integrations" className="space-y-6">
        <TabsList className="bg-gray-800 w-full">
          <TabsTrigger value="integrations" className="flex-1">
            <Plug className="w-4 h-4 mr-2" />
            Integrations
          </TabsTrigger>
          <TabsTrigger value="webhooks" className="flex-1">
            <Webhook className="w-4 h-4 mr-2" />
            Webhooks
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex-1">
            <Activity className="w-4 h-4 mr-2" />
            Activity
          </TabsTrigger>
        </TabsList>

        <TabsContent value="integrations">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {integrations.map((integration) => (
              <Card key={integration.id} className="bg-gray-800 border-gray-700">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center">
                        {integration.type === 'oauth' && <Zap className="w-5 h-5 text-[#00C2FF]" />}
                        {integration.type === 'api' && <Plug className="w-5 h-5 text-[#00C2FF]" />}
                        {integration.type === 'webhook' && <Webhook className="w-5 h-5 text-[#00C2FF]" />}
                        {integration.type === 'custom' && <Settings className="w-5 h-5 text-[#00C2FF]" />}
                      </div>
                      <div>
                        <CardTitle className="text-white text-lg">{integration.name}</CardTitle>
                        <p className="text-gray-400 text-sm capitalize">{integration.type} Integration</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(integration.status)}
                      <Badge className={getStatusColor(integration.status)}>
                        {integration.status}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">Enabled</span>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant={integration.enabled ? "default" : "outline"}
                        onClick={() => handleToggleIntegration(integration.id, !integration.enabled)}
                        className={integration.enabled ? "bg-[#00C2FF] hover:bg-[#0099CC]" : "border-gray-600"}
                      >
                        {integration.enabled ? 'Enabled' : 'Disabled'}
                      </Button>
                    </div>
                  </div>

                  {integration.lastSync && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm">Last Sync</span>
                      <span className="text-gray-300 text-sm">
                        {new Date(integration.lastSync).toLocaleString()}
                      </span>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleTestIntegration(integration.id)}
                      disabled={testingIntegration === integration.id}
                      className="border-gray-600 text-gray-300 flex-1"
                    >
                      {testingIntegration === integration.id ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          Testing...
                        </>
                      ) : (
                        <>
                          <TestTube className="w-4 h-4 mr-2" />
                          Test
                        </>
                      )}
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleSyncIntegration(integration.id)}
                      disabled={!integration.enabled}
                      className="border-gray-600 text-gray-300 flex-1"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Sync
                    </Button>

                    <Dialog open={configDialog} onOpenChange={setConfigDialog}>
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedIntegration(integration)}
                          className="border-gray-600 text-gray-300"
                        >
                          <Settings className="w-4 h-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-gray-800 border-gray-700">
                        <DialogHeader>
                          <DialogTitle className="text-white">Configure {selectedIntegration?.name}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <label className="text-gray-300 text-sm">Integration Type</label>
                            <Input
                              value={selectedIntegration?.type || ''}
                              readOnly
                              className="bg-gray-700 border-gray-600 text-white mt-1"
                            />
                          </div>
                          <div>
                            <label className="text-gray-300 text-sm">Status</label>
                            <Input
                              value={selectedIntegration?.status || ''}
                              readOnly
                              className="bg-gray-700 border-gray-600 text-white mt-1"
                            />
                          </div>
                          <p className="text-gray-400 text-sm">
                            Configuration options would be specific to each integration type.
                          </p>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="webhooks">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Recent Webhook Events</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {webhookEvents.length === 0 ? (
                  <div className="text-center py-8">
                    <Webhook className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-400">No webhook events yet. Use the "Test Webhook" button to simulate one.</p>
                  </div>
                ) : (
                  webhookEvents.map((event) => (
                    <div key={event.id} className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${event.processed ? 'bg-green-400' : 'bg-yellow-400'}`}></div>
                        <div>
                          <h4 className="font-semibold text-white">{event.event}</h4>
                          <p className="text-gray-400 text-sm">Source: {event.source}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-gray-300 text-sm">
                          {new Date(event.timestamp).toLocaleString()}
                        </p>
                        <Badge className={event.processed ? 'bg-green-600' : 'bg-yellow-600'}>
                          {event.processed ? 'Processed' : 'Pending'}
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Integration Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center py-8">
                  <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-400">Activity monitoring coming soon. This will show detailed logs of all integration activities.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnterpriseIntegrationsManager;
