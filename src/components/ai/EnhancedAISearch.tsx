
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Sparkles, 
  Brain, 
  Filter, 
  SlidersHorizontal,
  ArrowRight,
  Zap,
  TrendingUp
} from 'lucide-react';
import { semanticSearchService } from '@/services/semanticSearchService';
import { matchmakingService } from '@/services/matchmakingService';
import EnhancedAIMatching from './EnhancedAIMatching';
import { useBusinesses } from '@/hooks/useBusinesses';

interface SearchFilters {
  location?: string;
  category?: string;
  verified?: boolean;
  employeeRange?: string;
}

const EnhancedAISearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({});
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [activeMode, setActiveMode] = useState<'search' | 'matching'>('search');
  
  const { data: businesses } = useBusinesses();

  useEffect(() => {
    const loadSuggestions = async () => {
      if (searchQuery.length >= 2) {
        const newSuggestions = await semanticSearchService.getSearchSuggestions(searchQuery);
        setSuggestions(newSuggestions);
      } else {
        setSuggestions([]);
      }
    };

    const debounceTimer = setTimeout(loadSuggestions, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const performEnhancedSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const results = await semanticSearchService.searchBusinesses({
        query: searchQuery,
        filters,
        limit: 20,
        includeAnalysis: true
      });

      setSearchResults(results);
    } catch (error) {
      console.error('Enhanced search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    setSuggestions([]);
    performEnhancedSearch();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      performEnhancedSearch();
    }
  };

  return (
    <div className="space-y-6">
      {/* Enhanced Search Header */}
      <Card className="bg-gradient-to-r from-gray-800 to-gray-700 border-gray-600">
        <CardHeader>
          <CardTitle className="flex items-center text-white">
            <Brain className="w-5 h-5 mr-2 text-[#00C2FF]" />
            Enhanced AI Search & Matching
            <Badge className="ml-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white">
              Next-Gen AI
            </Badge>
          </CardTitle>
          <p className="text-gray-300">
            Advanced semantic search and intelligent business matching powered by AI
          </p>
        </CardHeader>
      </Card>

      {/* Search Mode Tabs */}
      <Tabs value={activeMode} onValueChange={(value: any) => setActiveMode(value)}>
        <TabsList className="bg-gray-800 w-full">
          <TabsTrigger value="search" className="flex-1">
            <Search className="w-4 h-4 mr-2" />
            Semantic Search
          </TabsTrigger>
          <TabsTrigger value="matching" className="flex-1">
            <Sparkles className="w-4 h-4 mr-2" />
            AI Matching
          </TabsTrigger>
        </TabsList>

        <TabsContent value="search" className="space-y-6">
          {/* Search Interface */}
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <div className="space-y-4">
                {/* Search Input */}
                <div className="relative">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Ask anything... e.g., 'Find AI companies in Birmingham using computer vision'"
                      className="pl-10 pr-16 py-3 bg-gray-700 border-gray-600 text-white text-lg"
                    />
                    <Button
                      onClick={performEnhancedSearch}
                      disabled={isSearching || !searchQuery.trim()}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-[#00C2FF] hover:bg-[#00A8D8]"
                      size="sm"
                    >
                      {isSearching ? (
                        <Brain className="w-4 h-4 animate-pulse" />
                      ) : (
                        <Zap className="w-4 h-4" />
                      )}
                    </Button>
                  </div>

                  {/* Search Suggestions */}
                  {suggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-gray-700 border border-gray-600 rounded-lg shadow-lg z-10">
                      {suggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="w-full text-left px-4 py-2 text-gray-300 hover:bg-gray-600 hover:text-white first:rounded-t-lg last:rounded-b-lg"
                        >
                          <Search className="w-3 h-3 inline mr-2" />
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Quick Filters */}
                <div className="flex items-center space-x-2">
                  <SlidersHorizontal className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-400">Quick filters:</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setFilters({ ...filters, verified: !filters.verified })}
                    className={`border-gray-600 text-gray-300 ${filters.verified ? 'bg-[#00C2FF] text-white' : ''}`}
                  >
                    Verified Only
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setFilters({ ...filters, location: filters.location ? undefined : 'Alabama' })}
                    className={`border-gray-600 text-gray-300 ${filters.location ? 'bg-[#00C2FF] text-white' : ''}`}
                  >
                    Alabama
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Search Results */}
          {isSearching && (
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-8 text-center">
                <Brain className="w-12 h-12 mx-auto text-[#00C2FF] animate-pulse mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">AI is analyzing your query...</h3>
                <p className="text-gray-300">
                  Processing natural language and finding the most relevant businesses
                </p>
              </CardContent>
            </Card>
          )}

          {searchResults.length > 0 && !isSearching && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">
                  Found {searchResults.length} relevant businesses
                </h3>
                <Badge variant="outline" className="border-[#00C2FF] text-[#00C2FF]">
                  AI-Ranked Results
                </Badge>
              </div>

              {searchResults.map((result, index) => (
                <Card key={result.business.id} className="bg-gray-800 border-gray-700 hover:border-[#00C2FF] transition-colors">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="text-lg font-semibold text-white">
                            {result.business.businessname}
                          </h4>
                          {result.business.verified && (
                            <Badge className="bg-green-500 text-white">Verified</Badge>
                          )}
                        </div>
                        <p className="text-gray-300 text-sm mb-3">
                          {result.business.description}
                        </p>
                        <div className="text-sm text-gray-400">
                          {result.business.location} • {result.business.category}
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold">
                          {result.relevanceScore}% Match
                        </Badge>
                      </div>
                    </div>

                    {/* Match Reasons */}
                    <div className="mb-4">
                      <div className="text-sm text-gray-300 mb-2">Why this matches your search:</div>
                      <div className="flex flex-wrap gap-2">
                        {result.matchingReasons.map((reason: string, reasonIndex: number) => (
                          <Badge
                            key={reasonIndex}
                            variant="outline"
                            className="text-xs border-[#00C2FF]/30 text-[#00C2FF] bg-[#00C2FF]/10"
                          >
                            {reason}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-[#00C2FF] hover:text-[#00A8D8] hover:bg-gray-700"
                      >
                        View Details
                        <ArrowRight className="w-3 h-3 ml-1" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="matching">
          <EnhancedAIMatching 
            searchQuery={searchQuery}
            matchingType="b2b"
            requirements={filters}
          />
        </TabsContent>
      </Tabs>

      {/* Quick Stats */}
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-[#00C2FF]">{businesses?.length || 0}</div>
              <div className="text-sm text-gray-400">Total Businesses</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-400">
                {businesses?.filter(b => b.verified).length || 0}
              </div>
              <div className="text-sm text-gray-400">Verified</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-400">
                {[...new Set(businesses?.map(b => b.category).filter(Boolean))].length}
              </div>
              <div className="text-sm text-gray-400">Categories</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-400">AI-Powered</div>
              <div className="text-sm text-gray-400">Search & Match</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedAISearch;
