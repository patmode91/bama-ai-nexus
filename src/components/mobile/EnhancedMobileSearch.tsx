import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Search, 
  Filter, 
  MapPin, 
  Star,
  Building2,
  Users,
  Zap,
  X,
  TrendingUp,
  Clock
} from 'lucide-react';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useDebounce } from '@/hooks/useDebounce';

interface SearchResult {
  id: string;
  name: string;
  category: string;
  rating: number;
  distance: number;
  isVerified: boolean;
  trending: boolean;
  recentlyViewed: boolean;
}

interface EnhancedMobileSearchProps {
  onResultSelect?: (result: SearchResult) => void;
  onClose?: () => void;
}

const EnhancedMobileSearch: React.FC<EnhancedMobileSearchProps> = ({ 
  onResultSelect, 
  onClose 
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([
    'AI Consulting',
    'Tech Startups',
    'Machine Learning',
    'Data Analytics'
  ]);

  const debouncedQuery = useDebounce(query, 300);
  const { latitude, longitude } = useGeolocation();

  const mockResults: SearchResult[] = [
    {
      id: '1',
      name: 'Alabama AI Solutions',
      category: 'AI Consulting',
      rating: 4.8,
      distance: 2.3,
      isVerified: true,
      trending: true,
      recentlyViewed: false
    },
    {
      id: '2',
      name: 'TechHub Birmingham',
      category: 'Tech Incubator',
      rating: 4.6,
      distance: 5.1,
      isVerified: true,
      trending: false,
      recentlyViewed: true
    },
    {
      id: '3',
      name: 'DataMind Analytics',
      category: 'Data Science',
      rating: 4.9,
      distance: 1.8,
      isVerified: true,
      trending: true,
      recentlyViewed: false
    }
  ];

  const filterOptions = [
    { id: 'verified', label: 'Verified Only', icon: Star },
    { id: 'nearby', label: 'Nearby (5mi)', icon: MapPin },
    { id: 'trending', label: 'Trending', icon: TrendingUp },
    { id: 'recent', label: 'Recently Viewed', icon: Clock }
  ];

  useEffect(() => {
    if (debouncedQuery) {
      setIsLoading(true);
      // Simulate API call
      setTimeout(() => {
        const filteredResults = mockResults.filter(result => 
          result.name.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
          result.category.toLowerCase().includes(debouncedQuery.toLowerCase())
        );
        setResults(filteredResults);
        setIsLoading(false);
      }, 500);
    } else {
      setResults([]);
    }
  }, [debouncedQuery]);

  const handleFilterToggle = (filterId: string) => {
    setActiveFilters(prev => 
      prev.includes(filterId) 
        ? prev.filter(id => id !== filterId)
        : [...prev, filterId]
    );
  };

  const handleRecentSearchClick = (searchTerm: string) => {
    setQuery(searchTerm);
  };

  const handleResultClick = (result: SearchResult) => {
    // Add to recent searches
    setRecentSearches(prev => [
      result.name,
      ...prev.filter(search => search !== result.name).slice(0, 3)
    ]);
    
    onResultSelect?.(result);
  };

  return (
    <div className="fixed inset-0 bg-gray-900/95 backdrop-blur-md z-50 md:hidden">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center space-x-3 p-4 border-b border-gray-700">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search businesses, services..."
              className="pl-10 bg-gray-800 border-gray-600 text-white placeholder-gray-400"
              autoFocus
            />
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="text-gray-300"
          >
            <Filter className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-300"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="p-4 border-b border-gray-700">
            <div className="flex flex-wrap gap-2">
              {filterOptions.map((filter) => (
                <Button
                  key={filter.id}
                  variant={activeFilters.includes(filter.id) ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleFilterToggle(filter.id)}
                  className="flex items-center space-x-1"
                >
                  <filter.icon className="w-3 h-3" />
                  <span>{filter.label}</span>
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Content */}
        <ScrollArea className="flex-1 p-4">
          {!query && recentSearches.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-300 mb-3">Recent Searches</h3>
              <div className="space-y-2">
                {recentSearches.map((search, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    onClick={() => handleRecentSearchClick(search)}
                    className="w-full justify-start text-left p-3 h-auto"
                  >
                    <Clock className="w-4 h-4 mr-3 text-gray-400" />
                    <span className="text-white">{search}</span>
                  </Button>
                ))}
              </div>
            </div>
          )}

          {isLoading && (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-gray-800 rounded-lg p-4 animate-pulse">
                  <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          )}

          {results.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-300">Search Results</h3>
              {results.map((result) => (
                <Card
                  key={result.id}
                  className="bg-gray-800 border-gray-700 cursor-pointer hover:bg-gray-750 transition-colors"
                  onClick={() => handleResultClick(result)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-semibold text-white">{result.name}</h4>
                          {result.isVerified && (
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          )}
                          {result.trending && (
                            <Badge variant="secondary" className="text-xs">
                              <TrendingUp className="w-3 h-3 mr-1" />
                              Trending
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-400 mb-2">{result.category}</p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Star className="w-3 h-3 fill-current text-yellow-500" />
                            <span>{result.rating}</span>
                          </div>
                          {latitude && longitude && (
                            <div className="flex items-center space-x-1">
                              <MapPin className="w-3 h-3" />
                              <span>{result.distance} mi</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <Building2 className="w-6 h-6 text-gray-400" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {query && !isLoading && results.length === 0 && (
            <div className="text-center py-12">
              <Search className="w-12 h-12 text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-300 mb-2">No results found</h3>
              <p className="text-gray-500">Try adjusting your search terms or filters</p>
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
};

export default EnhancedMobileSearch;
