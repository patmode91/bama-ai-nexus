
import { useState } from 'react';
import Header from '@/components/sections/Header';
import Footer from '@/components/sections/Footer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart3, TrendingUp, Users, Download, RefreshCw } from 'lucide-react';
import MetricsOverview from '@/components/analytics/MetricsOverview';
import CategoryInsights from '@/components/analytics/CategoryInsights';
import UserEngagement from '@/components/analytics/UserEngagement';
import AuthGuard from '@/components/auth/AuthGuard';
import { useBusinesses } from '@/hooks/useBusinesses';
import { toast } from 'sonner';

const Analytics = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { refetch: refetchBusinesses } = useBusinesses();

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetchBusinesses();
      toast.success('Analytics data refreshed');
    } catch (error) {
      toast.error('Failed to refresh data');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleExport = () => {
    toast.info('Export functionality coming soon');
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-b from-gray-700 to-gray-800">
        <Header />
        
        <main className="container mx-auto px-6 py-8">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                  <BarChart3 className="w-8 h-8 text-[#00C2FF]" />
                  Analytics Dashboard
                </h1>
                <p className="text-gray-300 mt-2">
                  Comprehensive insights into Alabama's AI business ecosystem
                </p>
              </div>
              
              <div className="flex gap-3">
                <Button
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
                <Button
                  onClick={handleExport}
                  className="bg-[#00C2FF] hover:bg-[#00A8D8]"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </div>

          {/* Analytics Tabs */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="bg-gray-800 border-gray-700">
              <TabsTrigger 
                value="overview" 
                className="data-[state=active]:bg-[#00C2FF] data-[state=active]:text-white"
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger 
                value="categories" 
                className="data-[state=active]:bg-[#00C2FF] data-[state=active]:text-white"
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Categories
              </TabsTrigger>
              <TabsTrigger 
                value="engagement" 
                className="data-[state=active]:bg-[#00C2FF] data-[state=active]:text-white"
              >
                <Users className="w-4 h-4 mr-2" />
                Engagement
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <MetricsOverview />
              
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Quick Insights</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                    <div className="p-4 bg-gray-700 rounded-lg">
                      <p className="text-gray-300">Most Active Category</p>
                      <p className="text-white font-semibold">Technology</p>
                    </div>
                    <div className="p-4 bg-gray-700 rounded-lg">
                      <p className="text-gray-300">Growth This Month</p>
                      <p className="text-green-400 font-semibold">+12.5%</p>
                    </div>
                    <div className="p-4 bg-gray-700 rounded-lg">
                      <p className="text-gray-300">Avg Session Time</p>
                      <p className="text-white font-semibold">4m 32s</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="categories" className="space-y-6">
              <CategoryInsights />
            </TabsContent>

            <TabsContent value="engagement" className="space-y-6">
              <UserEngagement />
            </TabsContent>
          </Tabs>
        </main>

        <Footer />
      </div>
    </AuthGuard>
  );
};

export default Analytics;
