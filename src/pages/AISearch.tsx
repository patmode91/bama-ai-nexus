
import { Helmet } from 'react-helmet-async';
import Header from '@/components/sections/Header';
import Footer from '@/components/sections/Footer';
import MCPEnhancedSearch from '@/components/ai/MCPEnhancedSearch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brain, Search, Zap, Network } from 'lucide-react';

const AISearch = () => {
  return (
    <div className="min-h-screen bg-gray-900">
      <Helmet>
        <title>AI-Powered Search - Alabama Business Directory</title>
        <meta name="description" content="Discover Alabama businesses using advanced AI search, semantic understanding, and intelligent matching algorithms." />
      </Helmet>
      
      <Header />
      
      <main className="py-16">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              AI-Powered Business Discovery
            </h1>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Find exactly what you're looking for with our advanced MCP AI agents.
              Get comprehensive business matches, market insights, and data enrichment in one search.
            </p>
          </div>

          {/* MCP Enhanced Search */}
          <Card className="bg-gray-800 border-gray-700 mb-8">
            <CardContent className="p-6">
              <MCPEnhancedSearch />
            </CardContent>
          </Card>

          {/* Agent Features Overview */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Search className="w-5 h-5 text-blue-400" />
                  The Connector
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400">
                  Intelligent business matching based on your requirements. Finds the most compatible 
                  companies using advanced scoring algorithms and contextual understanding.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Brain className="w-5 h-5 text-purple-400" />
                  The Analyst
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400">
                  Real-time market intelligence and insights. Analyzes trends, competitive landscape, 
                  pricing, and provides strategic recommendations for your business needs.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Zap className="w-5 h-5 text-green-400" />
                  The Curator
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400">
                  Data enrichment and quality analysis. Enhances business profiles with additional 
                  insights, compatibility scores, and data quality assessments.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* How It Works */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Network className="w-5 h-5 text-[#00C2FF]" />
                How Our AI Agents Work Together
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-[#00C2FF]/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-[#00C2FF] font-bold">1</span>
                  </div>
                  <h4 className="text-white font-medium mb-2">Context Analysis</h4>
                  <p className="text-gray-400 text-sm">
                    We analyze your search query to understand your specific business needs and requirements.
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-blue-400 font-bold">2</span>
                  </div>
                  <h4 className="text-white font-medium mb-2">Smart Matching</h4>
                  <p className="text-gray-400 text-sm">
                    The Connector finds and scores businesses based on compatibility with your requirements.
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-purple-400 font-bold">3</span>
                  </div>
                  <h4 className="text-white font-medium mb-2">Market Analysis</h4>
                  <p className="text-gray-400 text-sm">
                    The Analyst provides market insights, pricing trends, and strategic recommendations.
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-green-400 font-bold">4</span>
                  </div>
                  <h4 className="text-white font-medium mb-2">Data Enrichment</h4>
                  <p className="text-gray-400 text-sm">
                    The Curator enhances results with quality scores, additional insights, and recommendations.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default AISearch;
