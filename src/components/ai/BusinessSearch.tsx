
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Loader2, AlertCircle, MapPin, Star, ExternalLink } from 'lucide-react';
import { useConnectorAgent } from '@/hooks/useAgent';
import { useToast } from '@/hooks/use-toast';
import { logger } from '@/services/loggerService';

interface BusinessMatch {
  id: number;
  name: string;
  description: string;
  category: string;
  location: string;
  rating: number;
  matchScore: number;
  reason: string;
}

export const BusinessSearch: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<BusinessMatch[]>([]);
  const { toast } = useToast();

  const { callAgent, isLoading, error } = useConnectorAgent({
    onSuccess: (data) => {
      logger.info('Business search completed', { resultsCount: data?.matches?.length }, 'BusinessSearch');
      setResults(data?.matches || []);
      toast({
        title: "Search Complete",
        description: `Found ${data?.matches?.length || 0} business matches`,
      });
    },
    onError: (error) => {
      logger.error('Business search failed', { error: error.message, query }, 'BusinessSearch');
      setResults([]);
      toast({
        title: "Search Failed",
        description: "Unable to search businesses at this time",
        variant: "destructive",
      });
    }
  });

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isLoading) return;

    logger.info('Starting business search', { query }, 'BusinessSearch');
    
    try {
      await callAgent(query, { 
        searchType: 'semantic',
        includeAnalysis: true,
        maxResults: 10 
      });
    } catch (error) {
      logger.error('Search submission failed', { error, query }, 'BusinessSearch');
    }
  };

  const handleViewBusiness = (business: BusinessMatch) => {
    logger.info('Business viewed from search', { businessId: business.id, name: business.name }, 'BusinessSearch');
    // This could navigate to business detail page
    window.open(`/business/${business.id}`, '_blank');
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Search className="w-5 h-5 text-blue-400" />
            <span>Semantic Business Search</span>
          </CardTitle>
          <p className="text-gray-400 text-sm">
            Use natural language to find businesses that match your specific needs
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex space-x-2 mb-4">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g., 'AI consulting firms in Birmingham with healthcare experience'"
              disabled={isLoading}
              className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 flex-1"
            />
            <Button type="submit" disabled={isLoading || !query.trim()}>
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
            </Button>
          </form>

          {error && (
            <div className="flex items-center space-x-2 text-red-400 text-sm mb-4">
              <AlertCircle className="w-4 h-4" />
              <span>Search error: {error.message}</span>
            </div>
          )}

          {isLoading && (
            <div className="text-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-blue-400 mx-auto mb-2" />
              <p className="text-gray-400">Searching businesses...</p>
            </div>
          )}

          {results.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Search Results</h3>
                <Badge variant="outline" className="text-blue-400 border-blue-400">
                  {results.length} matches found
                </Badge>
              </div>
              
              <ScrollArea className="h-96">
                <div className="space-y-3 pr-4">
                  {results.map((business) => (
                    <Card key={business.id} className="bg-gray-700 border-gray-600 hover:border-gray-500 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <h4 className="font-semibold text-white mb-1">{business.name}</h4>
                            <p className="text-gray-300 text-sm mb-2">{business.description}</p>
                          </div>
                          <Badge 
                            variant="secondary" 
                            className="ml-2 bg-blue-600 text-white"
                          >
                            {Math.round(business.matchScore * 100)}% match
                          </Badge>
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-400 mb-2">
                          <div className="flex items-center space-x-1">
                            <MapPin className="w-3 h-3" />
                            <span>{business.location}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Star className="w-3 h-3" />
                            <span>{business.rating.toFixed(1)}</span>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {business.category}
                          </Badge>
                        </div>

                        <div className="bg-gray-800 p-2 rounded text-xs text-gray-300 mb-3">
                          <strong>Why this matches:</strong> {business.reason}
                        </div>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewBusiness(business)}
                          className="w-full"
                        >
                          <ExternalLink className="w-3 h-3 mr-2" />
                          View Business Details
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}

          {!isLoading && !error && results.length === 0 && query && (
            <div className="text-center py-8 text-gray-400">
              <Search className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No businesses found matching your search</p>
              <p className="text-sm">Try using different keywords or be more specific</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
