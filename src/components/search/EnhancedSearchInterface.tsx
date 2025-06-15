
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useDebounce } from '@/hooks/useDebounce';
import { enhancedSearchService, SearchFilters, SearchResponse } from '@/services/search/enhancedSearchService';
import SearchResultCard from './SearchResultCard';
import { 
  Search, 
  Filter, 
  Clock, 
  TrendingUp, 
  MapPin, 
  Tag,
  Star,
  CheckCircle,
  Loader2
} from 'lucide-react';

const EnhancedSearchInterface = () => {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({});
  const [searchResults, setSearchResults] = useState<SearchResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    if (debouncedQuery.length >= 2) {
      performSearch();
    } else {
      setSearchResults(null);
    }
  }, [debouncedQuery, filters, currentPage]);

  useEffect(() => {
    if (query.length >= 2) {
      fetchSuggestions();
    } else {
      setSuggestions([]);
    }
  }, [query]);

  const performSearch = async () => {
    setIsLoading(true);
    try {
      const results = await enhancedSearchService.search(
        debouncedQuery,
        filters,
        currentPage,
        20
      );
      setSearchResults(results);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSuggestions = async () => {
    try {
      const suggestions = await enhancedSearchService.getSearchSuggestions(query);
      setSuggestions(suggestions);
    } catch (error) {
      console.error('Failed to fetch suggestions:', error);
    }
  };

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({});
    setCurrentPage(1);
  };

  const handleBusinessClick = (businessId: number) => {
    // Track click analytics
    enhancedSearchService.trackClick(businessId, debouncedQuery);
    // Navigate to business profile
    window.location.href = `/business/${businessId}`;
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    setSuggestions([]);
  };

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <Card className="bg-gray-900/80 backdrop-blur-sm border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Search className="w-6 h-6" />
            <span>Enhanced Business Search</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Main Search Input */}
          <div className="relative">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search businesses, categories, locations..."
                className="pl-10 pr-4 py-2 bg-gray-800 border-gray-600 text-white"
              />
            </div>
            
            {/* Search Suggestions */}
            {suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-600 rounded-md shadow-lg z-10">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full px-4 py-2 text-left text-gray-300 hover:bg-gray-700 first:rounded-t-md last:rounded-b-md"
                  >
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span>{suggestion}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Filter Toggle */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="border-gray-600"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
              {Object.keys(filters).length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {Object.keys(filters).length}
                </Badge>
              )}
            </Button>

            {searchResults && (
              <div className="flex items-center space-x-4 text-sm text-gray-400">
                <span>{searchResults.totalCount} results</span>
                <span>{searchResults.searchTime.toFixed(0)}ms</span>
              </div>
            )}
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-800 rounded-lg border border-gray-600">
              {/* Location Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Location</label>
                <Input
                  value={filters.location || ''}
                  onChange={(e) => handleFilterChange('location', e.target.value)}
                  placeholder="City or region"
                  className="bg-gray-700 border-gray-600"
                />
              </div>

              {/* Category Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Category</label>
                <Select
                  value={filters.category || ''}
                  onValueChange={(value) => handleFilterChange('category', value)}
                >
                  <SelectTrigger className="bg-gray-700 border-gray-600">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Categories</SelectItem>
                    <SelectItem value="technology">Technology</SelectItem>
                    <SelectItem value="healthcare">Healthcare</SelectItem>
                    <SelectItem value="manufacturing">Manufacturing</SelectItem>
                    <SelectItem value="retail">Retail</SelectItem>
                    <SelectItem value="services">Services</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Verified Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Verification</label>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={filters.verified || false}
                    onCheckedChange={(checked) => handleFilterChange('verified', checked)}
                  />
                  <span className="text-sm text-gray-400">Verified only</span>
                  <CheckCircle className="w-4 h-4 text-green-500" />
                </div>
              </div>

              {/* Rating Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Minimum Rating</label>
                <div className="space-y-2">
                  <Slider
                    value={[filters.rating || 0]}
                    onValueChange={(value) => handleFilterChange('rating', value[0])}
                    max={5}
                    step={0.5}
                    className="w-full"
                  />
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>0</span>
                    <span className="flex items-center">
                      <Star className="w-3 h-3 mr-1" />
                      {filters.rating || 0}+
                    </span>
                    <span>5</span>
                  </div>
                </div>
              </div>

              {/* Founded After Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Founded After</label>
                <Input
                  type="number"
                  value={filters.foundedAfter || ''}
                  onChange={(e) => handleFilterChange('foundedAfter', parseInt(e.target.value) || undefined)}
                  placeholder="Year"
                  className="bg-gray-700 border-gray-600"
                />
              </div>

              {/* Clear Filters */}
              <div className="flex items-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearFilters}
                  className="border-gray-600"
                >
                  Clear All
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Search Results */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          <span className="ml-2 text-gray-400">Searching...</span>
        </div>
      )}

      {searchResults && !isLoading && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Facets Sidebar */}
          <div className="space-y-4">
            {/* Category Facets */}
            {searchResults.facets.categories.length > 0 && (
              <Card className="bg-gray-900/80 border-gray-700">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Categories</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {searchResults.facets.categories.map((facet, index) => (
                    <button
                      key={index}
                      onClick={() => handleFilterChange('category', facet.name)}
                      className="flex items-center justify-between w-full text-left text-sm text-gray-300 hover:text-white"
                    >
                      <span>{facet.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {facet.count}
                      </Badge>
                    </button>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Location Facets */}
            {searchResults.facets.locations.length > 0 && (
              <Card className="bg-gray-900/80 border-gray-700">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Locations</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {searchResults.facets.locations.map((facet, index) => (
                    <button
                      key={index}
                      onClick={() => handleFilterChange('location', facet.name)}
                      className="flex items-center justify-between w-full text-left text-sm text-gray-300 hover:text-white"
                    >
                      <span>{facet.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {facet.count}
                      </Badge>
                    </button>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Results Grid */}
          <div className="lg:col-span-3 space-y-4">
            {searchResults.results.length === 0 ? (
              <Card className="bg-gray-900/80 border-gray-700">
                <CardContent className="py-12 text-center">
                  <Search className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">No results found</h3>
                  <p className="text-gray-400">
                    Try adjusting your search terms or filters
                  </p>
                </CardContent>
              </Card>
            ) : (
              searchResults.results.map((result, index) => (
                <SearchResultCard
                  key={result.business.id}
                  business={result.business}
                  relevanceScore={result.relevanceScore}
                  matchHighlights={result.matchHighlights}
                  onClick={() => handleBusinessClick(result.business.id)}
                />
              ))
            )}

            {/* Pagination */}
            {searchResults.totalCount > 20 && (
              <div className="flex items-center justify-center space-x-2 pt-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="border-gray-600"
                >
                  Previous
                </Button>
                <span className="text-sm text-gray-400">
                  Page {currentPage} of {Math.ceil(searchResults.totalCount / 20)}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage >= Math.ceil(searchResults.totalCount / 20)}
                  className="border-gray-600"
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedSearchInterface;
