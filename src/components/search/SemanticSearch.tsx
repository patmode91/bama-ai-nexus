
import { useState, useCallback, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Target } from 'lucide-react';
import { semanticSearchService } from '@/services/semanticSearchService';
import { matchmakingService } from '@/services/matchmakingService';
import { toast } from 'sonner';
import SearchHeader from './SearchHeader';
import SearchInput from './SearchInput';
import SearchResultCard from './SearchResultCard';
import MatchResultCard from './MatchResultCard';
import RelatedQueries from './RelatedQueries';

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

  const handleViewProfile = (businessId: number) => {
    window.open(`/business/${businessId}`, '_blank');
  };

  const handleCompareToggle = (businessId: number) => {
    // Basic compare functionality - could be enhanced
    console.log('Compare toggled for business:', businessId);
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      <SearchHeader />

      <Card>
        <CardContent className="space-y-4 p-6">
          <SearchInput
            query={query}
            setQuery={setQuery}
            isLoading={isLoading}
            suggestions={suggestions}
            onSearch={handleSearch}
            onMatchmaking={handleMatchmaking}
            onSuggestionClick={handleSuggestionClick}
          />
        </CardContent>
      </Card>

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
                    <SearchResultCard
                      key={index}
                      business={result.business || result}
                      relevanceScore={result.relevanceScore || 75}
                      matchHighlights={result.matchHighlights || []}
                      onClick={() => handleViewProfile(result.business?.id || result.id)}
                    />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="matches" className="p-6">
                <div className="space-y-4">
                  {matchResults.map((match, index) => (
                    <MatchResultCard
                      key={index}
                      match={match}
                      onViewProfile={handleViewProfile}
                      onCompareToggle={handleCompareToggle}
                    />
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      <RelatedQueries
        relatedQueries={relatedQueries}
        onRelatedQueryClick={handleRelatedQueryClick}
      />
    </div>
  );
};

export default SemanticSearch;
