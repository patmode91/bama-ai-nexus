
import { useState } from 'react';
import AuthGuard from '@/components/auth/AuthGuard';
import Header from '@/components/sections/Header';
import Footer from '@/components/sections/Footer';
import MarketIntelligenceDashboard from '@/components/analytics/MarketIntelligenceDashboard';
import BusinessInsightsDashboard from '@/components/analytics/BusinessInsightsDashboard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import SEO from '@/components/seo/SEO';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Building2, 
  Brain,
  Target,
  AlertTriangle,
  Activity
} from 'lucide-react';

const Analytics = () => {
  const [selectedBusinessId, setSelectedBusinessId] = useState<number>(1);
  const [activeTab, setActiveTab] = useState('overview');

  // Mock business data for selection
  const mockBusinesses = [
    { id: 1, name: 'Tech Solutions Inc' },
    { id: 2, name: 'Alabama Construction Co' },
    { id: 3, name: 'Healthcare Partners' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <SEO 
        title="Advanced Analytics - Alabama Business Directory"
        description="Comprehensive business analytics, market intelligence, and AI-powered insights for Alabama businesses."
        keywords="business analytics, market intelligence, Alabama business insights, performance metrics, competitor analysis"
      />
      <Header />
      
      <main className="container mx-auto py-12 px-6">
        <AuthGuard>
          <div className="space-y-8">
            {/* Header */}
            <div className="text-center">
              <h1 className="text-4xl font-bold mb-4 flex items-center justify-center space-x-3">
                <BarChart3 className="w-10 h-10 text-blue-600" />
                <span>Advanced Analytics</span>
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Comprehensive market intelligence and AI-powered business insights
              </p>
            </div>

            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Businesses</CardTitle>
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">2,847</div>
                  <p className="text-xs text-muted-foreground">
                    +12% from last month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">8,456</div>
                  <p className="text-xs text-muted-foreground">
                    +18% from last month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Market Opportunities</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">127</div>
                  <p className="text-xs text-muted-foreground">
                    +8% from last month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">AI Insights</CardTitle>
                  <Brain className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">1,284</div>
                  <p className="text-xs text-muted-foreground">
                    Generated this week
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Main Analytics Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="w-full justify-start grid grid-cols-4">
                <TabsTrigger value="overview" className="flex items-center space-x-2">
                  <BarChart3 className="w-4 h-4" />
                  <span>Overview</span>
                </TabsTrigger>
                <TabsTrigger value="market" className="flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4" />
                  <span>Market Intelligence</span>
                </TabsTrigger>
                <TabsTrigger value="business" className="flex items-center space-x-2">
                  <Building2 className="w-4 h-4" />
                  <span>Business Insights</span>
                </TabsTrigger>
                <TabsTrigger value="competitive" className="flex items-center space-x-2">
                  <Activity className="w-4 h-4" />
                  <span>Competitive Analysis</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Market Trends Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                          <div className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-green-600" />
                            <span className="font-medium">Technology Sector</span>
                          </div>
                          <span className="text-green-600 font-semibold">+23%</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                          <div className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-blue-600" />
                            <span className="font-medium">Healthcare</span>
                          </div>
                          <span className="text-blue-600 font-semibold">+18%</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-yellow-600" />
                            <span className="font-medium">Retail</span>
                          </div>
                          <span className="text-yellow-600 font-semibold">-5%</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Top Opportunities</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <div className="p-3 border border-green-200 bg-green-50 rounded-lg">
                          <div className="font-medium text-green-800">Digital Transformation</div>
                          <div className="text-sm text-green-600">High potential • Low risk</div>
                        </div>
                        <div className="p-3 border border-blue-200 bg-blue-50 rounded-lg">
                          <div className="font-medium text-blue-800">Sustainable Solutions</div>
                          <div className="text-sm text-blue-600">High potential • Medium risk</div>
                        </div>
                        <div className="p-3 border border-purple-200 bg-purple-50 rounded-lg">
                          <div className="font-medium text-purple-800">Remote Services</div>
                          <div className="text-sm text-purple-600">Medium potential • Low risk</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="market" className="space-y-6">
                <MarketIntelligenceDashboard />
              </TabsContent>

              <TabsContent value="business" className="space-y-6">
                <div className="flex items-center gap-4 mb-6">
                  <label className="text-sm font-medium">Select Business:</label>
                  <Select value={selectedBusinessId.toString()} onValueChange={(value) => setSelectedBusinessId(parseInt(value))}>
                    <SelectTrigger className="w-64">
                      <SelectValue placeholder="Select a business" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockBusinesses.map((business) => (
                        <SelectItem key={business.id} value={business.id.toString()}>
                          {business.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <BusinessInsightsDashboard businessId={selectedBusinessId} />
              </TabsContent>

              <TabsContent value="competitive" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Competitive Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12 text-gray-500">
                      <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <h3 className="text-lg font-medium mb-2">Competitive Analysis</h3>
                      <p>Detailed competitor analysis and market positioning insights coming soon.</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </AuthGuard>
      </main>
      
      <Footer />
    </div>
  );
};

export default Analytics;
