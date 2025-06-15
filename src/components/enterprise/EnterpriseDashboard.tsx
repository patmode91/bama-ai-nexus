
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, 
  Plug, 
  TrendingUp, 
  Activity,
  Users,
  DollarSign,
  Zap,
  Settings
} from 'lucide-react';
import { useEnterpriseAnalytics } from '@/hooks/useEnterpriseAnalytics';
import { useEnterpriseIntegrations } from '@/hooks/useEnterpriseIntegrations';
import EnterpriseAnalyticsDashboard from './EnterpriseAnalyticsDashboard';
import EnterpriseIntegrationsManager from './EnterpriseIntegrationsManager';

const EnterpriseDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const { overview: analyticsOverview } = useEnterpriseAnalytics();
  const { stats: integrationStats } = useEnterpriseIntegrations();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Enterprise Dashboard</h1>
          <p className="text-gray-400 mt-2">Comprehensive business intelligence and system management</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="border-gray-600 text-gray-300"
          >
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-gray-800 w-full">
          <TabsTrigger value="overview" className="flex-1">
            <Activity className="w-4 h-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex-1">
            <BarChart3 className="w-4 h-4 mr-2" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="integrations" className="flex-1">
            <Plug className="w-4 h-4 mr-2" />
            Integrations
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Analytics Overview */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Analytics Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {analyticsOverview ? (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-700 p-3 rounded-lg">
                        <p className="text-gray-400 text-sm">Total Events</p>
                        <p className="text-xl font-bold text-white">{analyticsOverview.totalEvents}</p>
                      </div>
                      <div className="bg-gray-700 p-3 rounded-lg">
                        <p className="text-gray-400 text-sm">Event Types</p>
                        <p className="text-xl font-bold text-white">{analyticsOverview.uniqueEventTypes}</p>
                      </div>
                    </div>
                    <div className="bg-gray-700 p-3 rounded-lg">
                      <p className="text-gray-400 text-sm">Session ID</p>
                      <p className="text-sm font-mono text-white">{analyticsOverview.sessionId.slice(-12)}</p>
                    </div>
                  </>
                ) : (
                  <p className="text-gray-400">Loading analytics data...</p>
                )}
                <Button 
                  className="w-full bg-[#00C2FF] hover:bg-[#0099CC]"
                  onClick={() => setActiveTab('analytics')}
                >
                  View Full Analytics
                </Button>
              </CardContent>
            </Card>

            {/* Integrations Overview */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Plug className="w-5 h-5" />
                  Integrations Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {integrationStats ? (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-700 p-3 rounded-lg">
                        <p className="text-gray-400 text-sm">Total</p>
                        <p className="text-xl font-bold text-white">{integrationStats.total}</p>
                      </div>
                      <div className="bg-gray-700 p-3 rounded-lg">
                        <p className="text-gray-400 text-sm">Active</p>
                        <p className="text-xl font-bold text-green-400">{integrationStats.active}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-700 p-3 rounded-lg">
                        <p className="text-gray-400 text-sm">Webhooks</p>
                        <p className="text-xl font-bold text-white">{integrationStats.webhookEvents}</p>
                      </div>
                      <div className="bg-gray-700 p-3 rounded-lg">
                        <p className="text-gray-400 text-sm">Errors</p>
                        <p className="text-xl font-bold text-red-400">{integrationStats.errors}</p>
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="text-gray-400">Loading integration data...</p>
                )}
                <Button 
                  className="w-full bg-[#00C2FF] hover:bg-[#0099CC]"
                  onClick={() => setActiveTab('integrations')}
                >
                  Manage Integrations
                </Button>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-gray-800 border-gray-700 lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Button
                    variant="outline"
                    className="border-gray-600 text-gray-300 h-auto p-4 flex flex-col gap-2"
                  >
                    <BarChart3 className="w-6 h-6" />
                    <span>Generate Report</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="border-gray-600 text-gray-300 h-auto p-4 flex flex-col gap-2"
                  >
                    <Plug className="w-6 h-6" />
                    <span>Test Integration</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="border-gray-600 text-gray-300 h-auto p-4 flex flex-col gap-2"
                  >
                    <TrendingUp className="w-6 h-6" />
                    <span>View Trends</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="border-gray-600 text-gray-300 h-auto p-4 flex flex-col gap-2"
                  >
                    <Settings className="w-6 h-6" />
                    <span>System Config</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics">
          <EnterpriseAnalyticsDashboard />
        </TabsContent>

        <TabsContent value="integrations">
          <EnterpriseIntegrationsManager />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnterpriseDashboard;
