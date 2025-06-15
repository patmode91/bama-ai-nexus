
import { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Lightbulb, TrendingUp, Target, Zap, Star } from 'lucide-react';
import { semanticSearchService } from '@/services/semanticSearchService';
import { matchmakingService } from '@/services/matchmakingService';
import BusinessCard from '@/components/business/BusinessCard';
import { toast } from 'sonner';

const SemanticSearch = () => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [matchResults, setMatchResults] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [relatedQueries, setRelatedQueries] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('search');

  // Load suggestions on component mount
  useEffect(() => {
    const loadInitialSuggestions = async () => {
      try {
        const initialSuggestions = await semanticSearchService.getSearchSuggestions('');
        setSuggestions(initialSuggestions);
      } catch (error) {
        console.error('Failed to load suggestions:', error);
      }
    };
    loadInitialSuggestions();
  }, []);

  // Update suggestions as user types
  useEffect(() => {
    const updateSuggestions = async () => {
      if (query.length >= 2) {
        try {
          const newSuggestions = await semanticSearchService.getSearchSuggestions(query);
          setSuggestions(newSuggestions);
        } catch (error) {
          console.error('Failed to update suggestions:', error);
        }
      }
    };

    const timeoutId = setTimeout(updateSuggestions, 300);
    return () => clearTimeout(timeoutId);
  }, [query]);

  const handleSearch = useCallback(async () => {
    if (!query.trim()) {
      toast.error('Please enter a search query');
      return;
    }

    setIsLoading(true);
    try {
      const results = await semanticSearchService.searchBusinesses({
        query,
        limit: 20,
        includeAnalysis: true
      });

      setSearchResults(results);
      
      // Get related queries
      const related = await semanticSearchService.getRelatedQueries(query);
      setRelatedQueries(related);

      toast.success(`Found ${results.length} relevant businesses`);
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Search failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [query]);

  const handleMatchmaking = useCallback(async () => {
    if (!query.trim()) {
      toast.error('Please describe what you\'re looking for');
      return;
    }

    setIsLoading(true);
    try {
      const matches = await matchmakingService.findMatches({
        type: 'b2b',
        description: query,
        requirements: {
          location: 'Alabama'
        }
      });

      setMatchResults(matches);
      setActiveTab('matches');
      toast.success(`Found ${matches.length} potential matches`);
    } catch (error) {
      console.error('Matchmaking error:', error);
      toast.error('Matchmaking failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [query]);

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
  };

  const handleRelatedQueryClick = (relatedQuery: string) => {
    setQuery(relatedQuery);
  };

  const getConfidenceBadgeColor = (confidence: string) => {
    switch (confidence) {
      case 'high': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const handleViewProfile = (businessId: number) => {
    window.open(`/business/${businessId}`, '_blank');
  };

  const handleCompareToggle = (businessId: number) => {
    // Basic compare functionality - could be enhanced
    console.log('Compare toggled for business:', businessId);
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Search Input */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-blue-500" />
            AI-Powered Semantic Search
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Describe what you're looking for... (e.g., 'AI companies in Birmingham for computer vision projects')"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1"
            />
            <Button onClick={handleSearch} disabled={isLoading}>
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
            <Button onClick={handleMatchmaking} disabled={isLoading} variant="outline">
              <Target className="w-4 h-4 mr-2" />
              Find Matches
            </Button>
          </div>

          {/* Search Suggestions */}
          {suggestions.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Lightbulb className="w-4 h-4" />
                Suggestions:
              </div>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((suggestion, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="cursor-pointer hover:bg-blue-50"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    {suggestion}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      {(searchResults.length > 0 || matchResults.length > 0) && (
        <Card>
          <CardContent className="p-0">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full">
                <TabsTrigger value="search" className="flex items-center gap-2">
                  <Search className="w-4 h-4" />
                  Search Results ({searchResults.length})
                </TabsTrigger>
                <TabsTrigger value="matches" className="flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  AI Matches ({matchResults.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="search" className="p-6">
                <div className="space-y-4">
                  {searchResults.map((result, index) => (
                    <div key={index} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <BusinessCard 
                          business={result.business}
                          onViewProfile={handleViewProfile}
                          onCompareToggle={handleCompareToggle}
                          isCompared={false}
                          isCompareDisabled={false}
                        />
                        <div className="text-right space-y-1">
                          <Badge className="bg-blue-500 text-white">
                            {result.relevanceScore}% Match
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="text-sm font-medium text-gray-700">
                          Matching Reasons:
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {result.matchingReasons.map((reason: string, reasonIndex: number) => (
                            <Badge key={reasonIndex} variant="secondary" className="text-xs">
                              {reason}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="matches" className="p-6">
                <div className="space-y-4">
                  {matchResults.map((match, index) => (
                    <div key={index} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <BusinessCard 
                          business={match.business}
                          onViewProfile={handleViewProfile}
                          onCompareToggle={handleCompareToggle}
                          isCompared={false}
                          isCompareDisabled={false}
                        />
                        <div className="text-right space-y-1">
                          <Badge className="bg-purple-500 text-white">
                            {match.matchScore}% Match
                          </Badge>
                          <Badge className={`${getConfidenceBadgeColor(match.confidenceLevel)} text-white`}>
                            {match.confidenceLevel} confidence
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="text-sm font-medium text-gray-700">
                            Match Reasons:
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {match.matchReasons.map((reason: string, reasonIndex: number) => (
                              <Badge key={reasonIndex} variant="secondary" className="text-xs">
                                {reason}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="text-sm font-medium text-gray-700">
                            Recommendations:
                          </div>
                          <ul className="text-xs text-gray-600 space-y-1">
                            {match.recommendations.map((rec: string, recIndex: number) => (
                              <li key={recIndex} className="flex items-start gap-1">
                                <Star className="w-3 h-3 mt-0.5 text-yellow-500 flex-shrink-0" />
                                {rec}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Related Queries */}
      {relatedQueries.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <TrendingUp className="w-4 h-4" />
                Related Searches:
              </div>
              <div className="flex flex-wrap gap-2">
                {relatedQueries.map((query, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="cursor-pointer hover:bg-blue-50"
                    onClick={() => handleRelatedQueryClick(query)}
                  >
                    {query}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SemanticSearch;
