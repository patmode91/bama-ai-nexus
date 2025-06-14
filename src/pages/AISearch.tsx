
import { useState } from 'react';
import { Sparkles, Search, Zap } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Header from '@/components/sections/Header';
import Footer from '@/components/sections/Footer';
import SemanticSearch from '@/components/search/SemanticSearch';
import MatchmakingForm from '@/components/ai/MatchmakingForm';
import MatchResults from '@/components/ai/MatchResults';
import SEO from '@/components/seo/SEO';

const AISearch = () => {
  const [matchResults, setMatchResults] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);

  const handleMatchResults = (results: any[]) => {
    setMatchResults(results);
    setShowResults(true);
  };

  const handleBackToForm = () => {
    setShowResults(false);
    setMatchResults([]);
  };

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
        title="AI-Powered Search"
        description="Experience the future of business discovery with AI-powered semantic search and intelligent matchmaking"
      />
      <Header />
      
      <div className="container mx-auto px-6 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4 flex items-center justify-center gap-3">
            <Sparkles className="w-10 h-10 text-[#00C2FF]" />
            AI-Powered Discovery
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Experience the future of business discovery with our intelligent search and matchmaking engine
          </p>
        </div>

        {/* AI Features Showcase */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <Search className="w-6 h-6 text-[#00C2FF]" />
              <h3 className="text-xl font-semibold text-white">Semantic Search</h3>
            </div>
            <p className="text-gray-300 mb-4">
              Ask natural language questions and get intelligent, context-aware results that understand your intent.
            </p>
            <div className="bg-gray-700 rounded p-3 text-sm text-gray-400">
              Example: "Find aerospace companies in Huntsville using computer vision for quality control"
            </div>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <Zap className="w-6 h-6 text-purple-400" />
              <h3 className="text-xl font-semibold text-white">AI Matchmaking</h3>
            </div>
            <p className="text-gray-300 mb-4">
              Get personalized recommendations with confidence scores and detailed explanations of why each match is perfect for you.
            </p>
            <div className="bg-gray-700 rounded p-3 text-sm text-gray-400">
              B2B Solutions • Job Matching • Investor Connections
            </div>
          </div>
        </div>

        {/* Main AI Interface */}
        <Tabs defaultValue="search" className="space-y-6">
          <TabsList className="bg-gray-800 w-full">
            <TabsTrigger value="search" className="flex-1">
              <Search className="w-4 h-4 mr-2" />
              Semantic Search
            </TabsTrigger>
            <TabsTrigger value="matchmaking" className="flex-1">
              <Sparkles className="w-4 h-4 mr-2" />
              AI Matchmaking
            </TabsTrigger>
          </TabsList>

          <TabsContent value="search">
            <SemanticSearch />
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
