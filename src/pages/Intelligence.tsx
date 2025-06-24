
import { useState } from 'react';
import Header from '@/components/sections/Header';
import Footer from '@/components/sections/Footer';
import RealtimeAnalyticsDashboard from '@/components/analytics/RealtimeAnalyticsDashboard';
import BusinessIntelligenceHub from '@/components/intelligence/BusinessIntelligenceHub';
import EnhancedSystemMonitor from '@/components/monitoring/EnhancedSystemMonitor';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Brain, 
  BarChart3, 
  Server, 
  Activity,
  TrendingUp,
  Users,
  Building2,
  Zap
} from 'lucide-react';

const Intelligence = () => {
  const [activeTab, setActiveTab] = useState('analytics');

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-700 to-gray-800 text-white">
      <Header />
      
      <main className="container mx-auto py-12 px-6">
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4 flex items-center justify-center space-x-3">
              <Brain className="w-10 h-10" />
              <span>Intelligence Center</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Advanced analytics, business intelligence, and system monitoring for Alabama's business ecosystem
            </p>
          </div>

          {/* Key Metrics Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-gray-900/80 backdrop-blur-sm border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Insights</CardTitle>
                <Brain className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">127</div>
                <p className="text-xs text-muted-foreground">
                  +12 from last week
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/80 backdrop-blur-sm border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">System Health</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-400">98.7%</div>
                <p className="text-xs text-muted-foreground">
                  Operational uptime
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/80 backdrop-blur-sm border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Monitors</CardTitle>
                <Server className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">24</div>
                <p className="text-xs text-muted-foreground">
                  All systems monitored
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/80 backdrop-blur-sm border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Predictions</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">94%</div>
                <p className="text-xs text-muted-foreground">
                  Accuracy rate
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="bg-gray-800 border-gray-700 w-full justify-start">
              <TabsTrigger value="analytics" className="flex items-center space-x-2">
                <BarChart3 className="w-4 h-4" />
                <span>Analytics</span>
              </TabsTrigger>
              <TabsTrigger value="intelligence" className="flex items-center space-x-2">
                <Brain className="w-4 h-4" />
                <span>Business Intelligence</span>
              </TabsTrigger>
              <TabsTrigger value="monitoring" className="flex items-center space-x-2">
                <Server className="w-4 h-4" />
                <span>System Monitor</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="analytics" className="space-y-6">
              <RealtimeAnalyticsDashboard />
            </TabsContent>

            <TabsContent value="intelligence" className="space-y-6">
              <BusinessIntelligenceHub />
            </TabsContent>

            <TabsContent value="monitoring" className="space-y-6">
              <EnhancedSystemMonitor />
            </TabsContent>
          </Tabs>

          {/* Intelligence Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
            <Card className="bg-gray-900/80 backdrop-blur-sm border-gray-700 hover:border-blue-500/50 transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-blue-500" />
                  <span>Predictive Analytics</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">
                  AI-powered forecasting and trend prediction for market opportunities and business growth patterns.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/80 backdrop-blur-sm border-gray-700 hover:border-green-500/50 transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-green-500" />
                  <span>User Behavior Analysis</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">
                  Deep insights into user engagement patterns, preferences, and journey optimization opportunities.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/80 backdrop-blur-sm border-gray-700 hover:border-yellow-500/50 transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Building2 className="w-5 h-5 text-yellow-500" />
                  <span>Market Intelligence</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">
                  Comprehensive market analysis, competitive insights, and industry trend identification.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/80 backdrop-blur-sm border-gray-700 hover:border-purple-500/50 transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="w-5 h-5 text-purple-500" />
                  <span>Performance Optimization</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">
                  Real-time system performance monitoring with automated optimization recommendations.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/80 backdrop-blur-sm border-gray-700 hover:border-red-500/50 transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="w-5 h-5 text-red-500" />
                  <span>Anomaly Detection</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">
                  Advanced machine learning algorithms to detect unusual patterns and potential issues.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/80 backdrop-blur-sm border-gray-700 hover:border-cyan-500/50 transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Brain className="w-5 h-5 text-cyan-500" />
                  <span>Strategic Insights</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300">
                  AI-generated strategic recommendations based on comprehensive data analysis and market trends.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Intelligence;
