import { Helmet } from 'react-helmet-async';
import Header from '@/components/sections/Header';
import Footer from '@/components/sections/Footer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, 
  Brain, 
  Activity, 
  TrendingUp,
  Users,
  Building2,
  Target,
  Zap
} from 'lucide-react';
import AnalyticsDashboard from '@/components/analytics/AnalyticsDashboard';
import MarketIntelligence from '@/components/analytics/MarketIntelligence';
import UserEngagement from '@/components/analytics/UserEngagement';
import MetricsOverview from '@/components/analytics/MetricsOverview';
import CategoryInsights from '@/components/analytics/CategoryInsights';

const Analytics = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <Helmet>
        <title>Advanced Analytics - Alabama Business Directory</title>
        <meta name="description" content="Comprehensive analytics and market intelligence for Alabama's business ecosystem. Track trends, performance, and opportunities." />
      </Helmet>
      
      <Header />
      
      <main className="py-8">
        <div className="container mx-auto px-6">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Advanced Analytics & Business Intelligence
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Comprehensive business intelligence powered by AI. Discover trends, opportunities, 
              and strategic insights to drive informed decision-making across Alabama's ecosystem.
            </p>
          </div>

          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-6 mb-8 bg-gray-800/50 backdrop-blur-sm">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Overview
              </TabsTrigger>
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
              <TabsTrigger value="categories" className="flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                Categories
              </TabsTrigger>
              <TabsTrigger value="trends" className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Trends & Forecasts
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <MetricsOverview />
            </TabsContent>

            <TabsContent value="dashboard">
              <AnalyticsDashboard />
            </TabsContent>

            <TabsContent value="intelligence">
              <MarketIntelligence />
            </TabsContent>

            <TabsContent value="engagement">
              <UserEngagement />
            </TabsContent>

            <TabsContent value="categories">
              <CategoryInsights />
            </TabsContent>

            <TabsContent value="trends">
              <div className="p-6 text-center">
                <div className="max-w-4xl mx-auto">
                  <h3 className="text-3xl font-bold text-white mb-6">Predictive Analytics & Market Forecasting</h3>
                  <p className="text-gray-300 mb-12 text-lg">
                    Advanced AI-powered forecasting capabilities providing strategic insights for future planning and market positioning.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="p-8 bg-gray-900/80 backdrop-blur-sm border border-gray-700 rounded-lg">
                      <TrendingUp className="w-16 h-16 text-blue-400 mx-auto mb-6" />
                      <h4 className="text-xl font-semibold mb-4 text-white">Predictive Growth Modeling</h4>
                      <p className="text-gray-300">AI-powered forecasts for business growth patterns, market expansion opportunities, and revenue projections</p>
                    </div>
                    
                    <div className="p-8 bg-gray-900/80 backdrop-blur-sm border border-gray-700 rounded-lg">
                      <Brain className="w-16 h-16 text-purple-400 mx-auto mb-6" />
                      <h4 className="text-xl font-semibold mb-4 text-white">Market Signal Detection</h4>
                      <p className="text-gray-300">Early indicators of emerging market trends, competitive threats, and new business opportunities</p>
                    </div>
                    
                    <div className="p-8 bg-gray-900/80 backdrop-blur-sm border border-gray-700 rounded-lg">
                      <Target className="w-16 h-16 text-green-400 mx-auto mb-6" />
                      <h4 className="text-xl font-semibold mb-4 text-white">Strategic Scenario Planning</h4>
                      <p className="text-gray-300">Multiple market scenarios with risk assessments and strategic recommendations for optimal positioning</p>
                    </div>
                  </div>

                  <div className="mt-12 p-8 bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-700/30 rounded-lg">
                    <h4 className="text-2xl font-bold text-white mb-4">Coming Soon: Advanced Forecasting Suite</h4>
                    <p className="text-gray-300 mb-6">
                      Our AI-driven forecasting engine is currently in development, incorporating machine learning models 
                      that analyze historical data, market patterns, and external economic indicators to provide accurate 
                      business projections and strategic insights.
                    </p>
                    <div className="flex items-center justify-center space-x-6 text-sm text-gray-400">
                      <span>• 12-month revenue forecasts</span>
                      <span>• Competitive analysis projections</span>
                      <span>• Market sentiment tracking</span>
                      <span>• Risk assessment modeling</span>
                    </div>
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
