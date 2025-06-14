
import { useState } from 'react';
import { Search, Sparkles, Filter, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { semanticSearchService } from '@/services/semanticSearchService';
import { useToast } from '@/hooks/use-toast';

interface SearchFilters {
  location?: string;
  category?: string;
  verified?: boolean;
}

interface SearchResult {
  business: any;
  relevanceScore: number;
  matchingReasons: string[];
}

const SemanticSearch = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({});
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [relatedQueries, setRelatedQueries] = useState<string[]>([]);
  const { toast } = useToast();

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    setIsSearching(true);
    try {
      const searchResults = await semanticSearchService.searchBusinesses({
        query,
        filters,
        limit: 20
      });
      
      setResults(searchResults);
      
      // Get related queries
      const related = await semanticSearchService.getRelatedQueries(query);
      setRelatedQueries(related);
      
      if (searchResults.length === 0) {
        toast({
          title: "No results found",
          description: "Try adjusting your search terms or filters.",
        });
      }
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: "Search failed",
        description: "Please try again in a moment.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleQueryChange = async (value: string) => {
    setQuery(value);
    
    // Get search suggestions as user types
    if (value.length > 2) {
      try {
        const newSuggestions = await semanticSearchService.getSearchSuggestions(value);
        setSuggestions(newSuggestions);
      } catch (error) {
        console.error('Suggestions error:', error);
      }
    } else {
      setSuggestions([]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    setSuggestions([]);
    // Auto-search when suggestion is selected
    setTimeout(handleSearch, 100);
  };

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#00C2FF]" />
            AI-Powered Semantic Search
          </CardTitle>
          <p className="text-gray-400 text-sm">
            Ask natural language questions to find the perfect AI solution
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  value={query}
                  onChange={(e) => handleQueryChange(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="e.g., 'Find a company in Huntsville that uses computer vision for quality control in aerospace manufacturing'"
                  className="pl-10 bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
                />
              </div>
              <Button 
                onClick={handleSearch} 
                disabled={isSearching || !query.trim()}
                className="bg-[#00C2FF] hover:bg-[#00A8D8]"
              >
                {isSearching ? 'Searching...' : 'Search'}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="border-gray-600"
              >
                <Filter className="w-4 h-4" />
              </Button>
            </div>

            {/* Search Suggestions */}
            {suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 z-10 mt-1 bg-gray-700 border border-gray-600 rounded-md shadow-lg">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full px-3 py-2 text-left text-gray-300 hover:bg-gray-600 hover:text-white first:rounded-t-md last:rounded-b-md"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="grid md:grid-cols-3 gap-4 p-4 bg-gray-700 rounded-lg">
              <div className="space-y-2">
                <label className="text-sm text-gray-300">Location</label>
                <Select value={filters.location} onValueChange={(value) => setFilters({...filters, location: value})}>
                  <SelectTrigger className="bg-gray-600 border-gray-500">
                    <SelectValue placeholder="Any location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any location</SelectItem>
                    <SelectItem value="Birmingham">Birmingham</SelectItem>
                    <SelectItem value="Huntsville">Huntsville</SelectItem>
                    <SelectItem value="Mobile">Mobile</SelectItem>
                    <SelectItem value="Montgomery">Montgomery</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm text-gray-300">Category</label>
                <Select value={filters.category} onValueChange={(value) => setFilters({...filters, category: value})}>
                  <SelectTrigger className="bg-gray-600 border-gray-500">
                    <SelectValue placeholder="Any category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any category</SelectItem>
                    <SelectItem value="Technology">Technology</SelectItem>
                    <SelectItem value="Healthcare">Healthcare</SelectItem>
                    <SelectItem value="Aerospace">Aerospace</SelectItem>
                    <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                    <SelectItem value="Finance">Finance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm text-gray-300">Verified Only</label>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={filters.verified || false}
                    onCheckedChange={(checked) => setFilters({...filters, verified: checked})}
                  />
                  <span className="text-sm text-gray-400">Show only verified companies</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Search Results */}
      {results.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-white">
              Found {results.length} results for "{query}"
            </h3>
            {relatedQueries.length > 0 && (
              <div className="flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-yellow-400" />
                <span className="text-sm text-gray-400">Related searches available</span>
              </div>
            )}
          </div>
          
          {results.map((result, index) => (
            <Card key={result.business.id || index} className="bg-gray-800 border-gray-700">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-white">{result.business.businessname}</CardTitle>
                    <p className="text-gray-400 text-sm">{result.business.location}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-[#00C2FF]/20 text-[#00C2FF]">
                      {Math.round(result.relevanceScore)}% match
                    </Badge>
                    {result.business.verified && (
                      <Badge variant="secondary" className="bg-green-500/20 text-green-400">
                        Verified
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-gray-300 text-sm">
                  {result.business.description?.slice(0, 200)}...
                </p>
                
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-white">Why it's a match:</h4>
                  <div className="flex flex-wrap gap-1">
                    {result.matchingReasons.map((reason, reasonIndex) => (
                      <Badge key={reasonIndex} variant="outline" className="text-xs border-gray-600 text-gray-400">
                        {reason}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div className="flex gap-2 pt-2">
                  <Button size="sm" className="bg-[#00C2FF] hover:bg-[#00A8D8]">
                    View Profile
                  </Button>
                  <Button size="sm" variant="outline" className="border-gray-600">
                    Contact
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Related Queries */}
      {relatedQueries.length > 0 && results.length > 0 && (
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white text-lg flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-yellow-400" />
              Related Searches
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {relatedQueries.map((relatedQuery, index) => (
              <Button
                key={index}
                variant="ghost"
                className="justify-start text-left h-auto p-3 text-gray-300 hover:text-white hover:bg-gray-700"
                onClick={() => handleSuggestionClick(relatedQuery)}
              >
                "{relatedQuery}"
              </Button>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Example Queries */}
      {results.length === 0 && (
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white text-lg">Try these example searches:</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {[
              "Find a company that specializes in NLP for healthcare applications",
              "Show me aerospace companies in Huntsville using machine learning",
              "I need computer vision solutions for quality control in manufacturing",
              "Find AI startups in Birmingham working on fintech applications",
              "Show verified companies that offer predictive analytics services"
            ].map((example, index) => (
              <Button
                key={index}
                variant="ghost"
                className="justify-start text-left h-auto p-3 text-gray-300 hover:text-white hover:bg-gray-700"
                onClick={() => setQuery(example)}
              >
                "{example}"
              </Button>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SemanticSearch;
