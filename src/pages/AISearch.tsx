
import { Helmet } from 'react-helmet-async';
import Header from '@/components/sections/Header';
import Footer from '@/components/sections/Footer';
import SemanticSearch from '@/components/search/SemanticSearch';
import EnhancedAISearch from '@/components/ai/EnhancedAISearch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brain, Search, Zap } from 'lucide-react';

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
              Find exactly what you're looking for with our advanced AI search and matching technology.
              Discover Alabama businesses through semantic understanding and intelligent recommendations.
            </p>
          </div>

          <Card className="bg-gray-800 border-gray-700 mb-8">
            <CardContent className="p-0">
              <Tabs defaultValue="semantic" className="w-full">
                <TabsList className="w-full bg-gray-900 border-b border-gray-700">
                  <TabsTrigger value="semantic" className="flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    Semantic Search
                  </TabsTrigger>
                  <TabsTrigger value="enhanced" className="flex items-center gap-2">
                    <Brain className="w-4 h-4" />
                    Enhanced AI Search
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="semantic" className="p-6">
                  <SemanticSearch />
                </TabsContent>

                <TabsContent value="enhanced" className="p-6">
                  <EnhancedAISearch />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Features Overview */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Search className="w-5 h-5 text-blue-400" />
                  Semantic Understanding
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400">
                  Our AI understands the intent behind your search, finding businesses that match what you actually need, not just keyword matches.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Brain className="w-5 h-5 text-purple-400" />
                  Intelligent Matching
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400">
                  Advanced algorithms analyze business capabilities, location, size, and expertise to find the perfect matches for your requirements.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Zap className="w-5 h-5 text-yellow-400" />
                  Smart Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400">
                  Get personalized suggestions for next steps, related businesses, and partnership opportunities based on your search patterns.
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

export default AISearch;
