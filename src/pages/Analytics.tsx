
import { Helmet } from 'react-helmet-async';
import Header from '@/components/sections/Header';
import Footer from '@/components/sections/Footer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, 
  Brain, 
  Activity, 
  TrendingUp 
} from 'lucide-react';
import AnalyticsDashboard from '@/components/analytics/AnalyticsDashboard';
import MarketIntelligence from '@/components/analytics/MarketIntelligence';
import UserEngagement from '@/components/analytics/UserEngagement';

const Analytics = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>Advanced Analytics - Alabama Business Directory</title>
        <meta name="description" content="Comprehensive analytics and market intelligence for Alabama's business ecosystem. Track trends, performance, and opportunities." />
      </Helmet>
      
      <Header />
      
      <main className="py-8">
        <div className="container mx-auto px-6">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Advanced Analytics & Insights
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive business intelligence powered by AI. Discover trends, opportunities, 
              and strategic insights to drive informed decision-making.
            </p>
          </div>

          <Tabs defaultValue="dashboard" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-8">
              <TabsTrigger value="dashboard" className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="intelligence" className="flex items-center gap-2">
                <Brain className="w-4 h-4" />
                Market Intelligence
              </TabsTrigger>
              <TabsTrigger value="engagement" className="flex items-center gap-2">
                <Activity className="w-4 h-4" />
                User Engagement
              </TabsTrigger>
              <TabsTrigger value="trends" className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Trends & Forecasts
              </TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard">
              <AnalyticsDashboard />
            </TabsContent>

            <TabsContent value="intelligence">
              <MarketIntelligence />
            </TabsContent>

            <TabsContent value="engagement">
              <UserEngagement />
            </TabsContent>

            <TabsContent value="trends">
              <div className="p-6 text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Trends & Forecasts</h3>
                <p className="text-gray-600 mb-8">
                  Advanced predictive analytics and market forecasting capabilities coming soon.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-6 bg-white rounded-lg border">
                    <TrendingUp className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                    <h4 className="font-semibold mb-2">Predictive Growth</h4>
                    <p className="text-sm text-gray-600">AI-powered forecasts for business growth and market expansion</p>
                  </div>
                  <div className="p-6 bg-white rounded-lg border">
                    <Brain className="w-12 h-12 text-purple-500 mx-auto mb-4" />
                    <h4 className="font-semibold mb-2">Market Signals</h4>
                    <p className="text-sm text-gray-600">Early indicators of emerging market trends and opportunities</p>
                  </div>
                  <div className="p-6 bg-white rounded-lg border">
                    <Activity className="w-12 h-12 text-green-500 mx-auto mb-4" />
                    <h4 className="font-semibold mb-2">Scenario Planning</h4>
                    <p className="text-sm text-gray-600">Strategic planning tools with multiple market scenarios</p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Analytics;
