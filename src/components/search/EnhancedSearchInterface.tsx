
import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { 
  Search, 
  Filter, 
  Clock, 
  TrendingUp, 
  MapPin, 
  Star,
  Verified,
  SlidersHorizontal
} from 'lucide-react';
import { enhancedSearchService, SearchFilters, SearchResponse } from '@/services/search/enhancedSearchService';
import { useDebounce } from '@/hooks/useDebounce';
import BusinessCard from '@/components/business/BusinessCard';

const EnhancedSearchInterface = () => {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({});
  const [searchResults, setSearchResults] = useState<SearchResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const debouncedQuery = useDebounce(query, 300);

  const performSearch = useCallback(async (searchQuery: string, searchFilters: SearchFilters, page: number = 1) => {
    if (!searchQuery.trim() && Object.keys(searchFilters).length === 0) {
      setSearchResults(null);
      return;
    }

    setIsLoading(true);
    try {
      const results = await enhancedSearchService.search(searchQuery, searchFilters, page);
      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getSuggestions = useCallback(async (partialQuery: string) => {
    if (partialQuery.length >= 2) {
      const suggestions = await enhancedSearchService.getSearchSuggestions(partialQuery);
      setSuggestions(suggestions);
    } else {
      setSuggestions([]);
    }
  }, []);

  useEffect(() => {
    getSuggestions(debouncedQuery);
  }, [debouncedQuery, getSuggestions]);

  useEffect(() => {
    performSearch(debouncedQuery, filters, 1);
    setCurrentPage(1);
  }, [debouncedQuery, filters, performSearch]);

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    setSuggestions([]);
  };

  const handleBusinessClick = (businessId: number) => {
    if (query) {
      enhancedSearchService.trackClick(businessId, query);
    }
  };

  const clearFilters = () => {
    setFilters({});
  };

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center text-white">
            <Search className="w-5 h-5 mr-2" />
            Enhanced Business Search
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search for businesses, services, or industries..."
                className="pl-10 pr-16 py-3 bg-gray-700 border-gray-600 text-white text-lg"
              />
              <Button
                onClick={() => setShowFilters(!showFilters)}
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
              >
                <SlidersHorizontal className="w-4 h-4" />
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
                    <Clock className="w-3 h-3 inline mr-2" />
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <Card className="bg-gray-700 border-gray-600">
              <CardContent className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-white font-medium">Filters</h3>
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    Clear All
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Location Filter */}
                  <div>
                    <label className="text-sm text-gray-300 mb-2 block">Location</label>
                    <Input
                      value={filters.location || ''}
                      onChange={(e) => handleFilterChange('location', e.target.value)}
                      placeholder="City or region"
                      className="bg-gray-600 border-gray-500 text-white"
                    />
                  </div>

                  {/* Category Filter */}
                  <div>
                    <label className="text-sm text-gray-300 mb-2 block">Category</label>
                    <Input
                      value={filters.category || ''}
                      onChange={(e) => handleFilterChange('category', e.target.value)}
                      placeholder="Business category"
                      className="bg-gray-600 border-gray-500 text-white"
                    />
                  </div>

                  {/* Rating Filter */}
                  <div>
                    <label className="text-sm text-gray-300 mb-2 block">
                      Minimum Rating: {filters.rating || 0} stars
                    </label>
                    <Slider
                      value={[filters.rating || 0]}
                      onValueChange={(value) => handleFilterChange('rating', value[0])}
                      max={5}
                      step={0.5}
                      className="mt-2"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <label className="flex items-center space-x-2 text-gray-300">
                    <Checkbox
                      checked={filters.verified || false}
                      onCheckedChange={(checked) => handleFilterChange('verified', checked)}
                    />
                    <Verified className="w-4 h-4" />
                    <span>Verified businesses only</span>
                  </label>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Active Filters */}
          {Object.keys(filters).length > 0 && (
            <div className="flex flex-wrap gap-2">
              {Object.entries(filters).map(([key, value]) => {
                if (!value) return null;
                return (
                  <Badge
                    key={key}
                    variant="secondary"
                    className="bg-gray-600 text-gray-200"
                  >
                    {key}: {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value}
                    <button
                      onClick={() => handleFilterChange(key as keyof SearchFilters, undefined)}
                      className="ml-2 hover:text-white"
                    >
                      ×
                    </button>
                  </Badge>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Search Results */}
      {isLoading && (
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-8 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-300">Searching businesses...</p>
          </CardContent>
        </Card>
      )}

      {searchResults && !isLoading && (
        <div className="space-y-6">
          {/* Results Header */}
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className="text-white">
                    Found {searchResults.totalCount} businesses
                  </span>
                  <Badge variant="outline" className="border-blue-500 text-blue-400">
                    {searchResults.searchTime.toFixed(0)}ms
                  </Badge>
                </div>
                <div className="flex items-center space-x-2 text-gray-400">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-sm">Ranked by relevance</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Results List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {searchResults.results.map((result, index) => (
              <div key={result.business.id} className="space-y-2">
                <BusinessCard
                  business={result.business}
                  onClick={() => handleBusinessClick(result.business.id)}
                />
                
                {/* Match Details */}
                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between mb-2">
                      <Badge className="bg-blue-500 text-white">
                        {result.relevanceScore}% Match
                      </Badge>
                      <span className="text-xs text-gray-400">#{index + 1}</span>
                    </div>
                    
                    {result.matchHighlights.length > 0 && (
                      <div className="space-y-1">
                        {result.matchHighlights.slice(0, 2).map((highlight, idx) => (
                          <div key={idx} className="text-xs text-gray-300 flex items-center">
                            <Star className="w-3 h-3 mr-1 text-yellow-400" />
                            {highlight}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {searchResults.totalCount > 20 && (
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-center space-x-2">
                  <Button
                    variant="outline"
                    disabled={currentPage === 1}
                    onClick={() => {
                      const newPage = currentPage - 1;
                      setCurrentPage(newPage);
                      performSearch(query, filters, newPage);
                    }}
                  >
                    Previous
                  </Button>
                  <span className="text-gray-300">
                    Page {currentPage} of {Math.ceil(searchResults.totalCount / 20)}
                  </span>
                  <Button
                    variant="outline"
                    disabled={currentPage >= Math.ceil(searchResults.totalCount / 20)}
                    onClick={() => {
                      const newPage = currentPage + 1;
                      setCurrentPage(newPage);
                      performSearch(query, filters, newPage);
                    }}
                  >
                    Next
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Faceted Search Results */}
      {searchResults?.facets && (
        <Tabs defaultValue="categories" className="space-y-4">
          <TabsList className="bg-gray-800">
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="locations">Locations</TabsTrigger>
          </TabsList>
          
          <TabsContent value="categories">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Popular Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {searchResults.facets.categories.slice(0, 8).map(facet => (
                    <Button
                      key={facet.name}
                      variant="outline"
                      size="sm"
                      onClick={() => handleFilterChange('category', facet.name)}
                      className="justify-between border-gray-600 text-gray-300"
                    >
                      {facet.name}
                      <Badge variant="secondary" className="ml-2">
                        {facet.count}
                      </Badge>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="locations">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Popular Locations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {searchResults.facets.locations.slice(0, 8).map(facet => (
                    <Button
                      key={facet.name}
                      variant="outline"
                      size="sm"
                      onClick={() => handleFilterChange('location', facet.name)}
                      className="justify-between border-gray-600 text-gray-300"
                    >
                      <MapPin className="w-3 h-3 mr-1" />
                      {facet.name}
                      <Badge variant="secondary" className="ml-2">
                        {facet.count}
                      </Badge>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default EnhancedSearchInterface;
