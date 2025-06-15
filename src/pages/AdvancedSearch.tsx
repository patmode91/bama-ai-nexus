
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/sections/Header';
import Footer from '@/components/sections/Footer';
import EnhancedSearchInterface from '@/components/search/EnhancedSearchInterface';
import AdvancedSearch from '@/components/search/AdvancedSearch';
import EnhancedAISearch from '@/components/ai/EnhancedAISearch';
import SEO from '@/components/seo/SEO';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Brain, 
  Filter, 
  TrendingUp,
  Target,
  Zap
} from 'lucide-react';
import { SearchFilters } from '@/types/search';

const AdvancedSearchPage = () => {
  const navigate = useNavigate();
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('enhanced');

  const handleSearch = (query: string, filters: SearchFilters) => {
    console.log('Search triggered:', { query, filters });
    // Search logic will be handled by the individual components
  };

  const handleClearSearch = () => {
    setSearchResults([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      <SEO 
        title="Advanced Search - Alabama Business Directory"
        description="Advanced semantic search, AI-powered discovery, and intelligent filtering for Alabama businesses."
        keywords="advanced search, semantic search, AI search, business discovery, Alabama businesses"
      />
      <Header />
      
      <main className="container mx-auto py-12 px-6">
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4 flex items-center justify-center space-x-3 text-white">
              <Search className="w-10 h-10 text-[#00C2FF]" />
              <span>Advanced Search & Discovery</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Powerful search tools with AI-driven insights and semantic understanding
            </p>
          </div>

          {/* Search Mode Selector */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <div className="flex justify-center">
              <TabsList className="bg-gray-800 border border-gray-700">
                <TabsTrigger value="enhanced" className="flex items-center space-x-2">
                  <Filter className="w-4 h-4" />
                  <span>Enhanced Search</span>
                </TabsTrigger>
                <TabsTrigger value="traditional" className="flex items-center space-x-2">
                  <Search className="w-4 h-4" />
                  <span>Traditional</span>
                </TabsTrigger>
                <TabsTrigger value="ai" className="flex items-center space-x-2">
                  <Brain className="w-4 h-4" />
                  <span>AI Search</span>
                  <Badge className="ml-1 bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xs">
                    Beta
                  </Badge>
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Enhanced Search Interface */}
            <TabsContent value="enhanced" className="space-y-6">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-white">
                    <Zap className="w-5 h-5 text-[#00C2FF]" />
                    <span>Enhanced Search Engine</span>
                  </CardTitle>
                  <p className="text-gray-300">
                    Advanced filtering, faceted search, and intelligent ranking
                  </p>
                </CardHeader>
                <CardContent>
                  <EnhancedSearchInterface />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Traditional Search */}
            <TabsContent value="traditional" className="space-y-6">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-white">
                    <Search className="w-5 h-5 text-[#00C2FF]" />
                    <span>Traditional Search</span>
                  </CardTitle>
                  <p className="text-gray-300">
                    Classic search with advanced filters and sorting options
                  </p>
                </CardHeader>
                <CardContent>
                  <AdvancedSearch 
                    onSearch={handleSearch}
                    onClearSearch={handleClearSearch}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* AI-Powered Search */}
            <TabsContent value="ai" className="space-y-6">
              <EnhancedAISearch />
            </TabsContent>
          </Tabs>

          {/* Search Features Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-6 text-center">
                <TrendingUp className="w-12 h-12 mx-auto mb-4 text-[#00C2FF]" />
                <h3 className="text-lg font-semibold text-white mb-2">Smart Ranking</h3>
                <p className="text-gray-300 text-sm">
                  AI-powered relevance scoring based on multiple factors
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-6 text-center">
                <Target className="w-12 h-12 mx-auto mb-4 text-green-400" />
                <h3 className="text-lg font-semibold text-white mb-2">Semantic Search</h3>
                <p className="text-gray-300 text-sm">
                  Understands context and intent, not just keywords
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-6 text-center">
                <Filter className="w-12 h-12 mx-auto mb-4 text-purple-400" />
                <h3 className="text-lg font-semibold text-white mb-2">Advanced Filters</h3>
                <p className="text-gray-300 text-sm">
                  Faceted search with dynamic filtering options
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

export default AdvancedSearchPage;
