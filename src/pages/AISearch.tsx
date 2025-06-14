
import { useState } from 'react';
import { Sparkles, Search, Zap, TrendingUp, Users, MapPin } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/sections/Header';
import Footer from '@/components/sections/Footer';
import EnhancedAISearch from '@/components/ai/EnhancedAISearch';
import PersonalizedRecommendationEngine from '@/components/ai/PersonalizedRecommendationEngine';
import MatchmakingForm from '@/components/ai/MatchmakingForm';
import MatchResults from '@/components/ai/MatchResults';
import SEO from '@/components/seo/SEO';
import { useBusinesses } from '@/hooks/useBusinesses';

const AISearch = () => {
  const [matchResults, setMatchResults] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);
  const { data: businesses } = useBusinesses();

  const handleMatchResults = (results: any[]) => {
    setMatchResults(results);
    setShowResults(true);
  };

  const handleBackToForm = () => {
    setShowResults(false);
    setMatchResults([]);
  };

  // Calculate ecosystem stats
  const totalBusinesses = businesses?.length || 0;
  const verifiedBusinesses = businesses?.filter(b => b.verified).length || 0;
  const categories = [...new Set(businesses?.map(b => b.category).filter(Boolean))].length;
  const locations = [...new Set(businesses?.map(b => b.location).filter(Boolean))].length;

  if (showResults) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-700 to-gray-800">
        <SEO 
          title="AI Search Results"
          description="AI-powered search and matchmaking results for Alabama's AI ecosystem"
        />
        <Header />
        <div className="container mx-auto px-6 py-16">
          <MatchResults results={matchResults} onBack={handleBackToForm} />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-700 to-gray-800">
      <SEO 
        title="Enhanced AI-Powered Discovery"
        description="Experience next-generation AI search, intelligent matching, and personalized recommendations"
      />
      <Header />
      
      <div className="container mx-auto px-6 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4 flex items-center justify-center gap-3">
            <Sparkles className="w-10 h-10 text-[#00C2FF]" />
            Enhanced AI Discovery
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-6">
            Next-generation AI-powered search, intelligent matching, and personalized recommendations
          </p>
          
          {/* Ecosystem Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-[#00C2FF]">{totalBusinesses}</div>
                <div className="text-sm text-gray-400">Total Businesses</div>
              </CardContent>
            </Card>
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-400">{verifiedBusinesses}</div>
                <div className="text-sm text-gray-400">Verified</div>
              </CardContent>
            </Card>
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-400">{categories}</div>
                <div className="text-sm text-gray-400">Industries</div>
              </CardContent>
            </Card>
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-yellow-400">{locations}</div>
                <div className="text-sm text-gray-400">Locations</div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Enhanced AI Features Showcase */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-gradient-to-br from-gray-800 to-gray-700 border border-gray-600 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <Search className="w-6 h-6 text-[#00C2FF]" />
              <h3 className="text-xl font-semibold text-white">Enhanced Semantic Search</h3>
            </div>
            <p className="text-gray-300 mb-4">
              Advanced natural language understanding with contextual awareness and intelligent query interpretation.
            </p>
            <div className="bg-gray-700 rounded p-3 text-sm text-gray-400">
              "Find aerospace companies using AI for predictive maintenance"
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-800 to-gray-700 border border-gray-600 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <Zap className="w-6 h-6 text-purple-400" />
              <h3 className="text-xl font-semibold text-white">AI-Powered Matching</h3>
            </div>
            <p className="text-gray-300 mb-4">
              Multi-dimensional compatibility analysis with confidence scoring and detailed explanations.
            </p>
            <div className="bg-gray-700 rounded p-3 text-sm text-gray-400">
              B2B • Job Matching • Investment Opportunities
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-800 to-gray-700 border border-gray-600 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="w-6 h-6 text-green-400" />
              <h3 className="text-xl font-semibold text-white">Personalized Recommendations</h3>
            </div>
            <p className="text-gray-300 mb-4">
              Machine learning-driven suggestions that adapt to your preferences and behavior patterns.
            </p>
            <div className="bg-gray-700 rounded p-3 text-sm text-gray-400">
              Smart • Adaptive • Continuously Learning
            </div>
          </div>
        </div>

        {/* Main Enhanced AI Interface */}
        <Tabs defaultValue="search" className="space-y-6">
          <TabsList className="bg-gray-800 w-full grid grid-cols-3">
            <TabsTrigger value="search" className="flex-1">
              <Search className="w-4 h-4 mr-2" />
              Enhanced Search
            </TabsTrigger>
            <TabsTrigger value="recommendations" className="flex-1">
              <TrendingUp className="w-4 h-4 mr-2" />
              AI Recommendations
            </TabsTrigger>
            <TabsTrigger value="matchmaking" className="flex-1">
              <Sparkles className="w-4 h-4 mr-2" />
              Matchmaking
            </TabsTrigger>
          </TabsList>

          <TabsContent value="search">
            <EnhancedAISearch />
          </TabsContent>

          <TabsContent value="recommendations">
            <PersonalizedRecommendationEngine />
          </TabsContent>

          <TabsContent value="matchmaking">
            <MatchmakingForm onResults={handleMatchResults} />
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
};

export default AISearch;
