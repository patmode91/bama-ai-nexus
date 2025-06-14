
import { useState } from 'react';
import { Search, Sparkles, TrendingUp, Building2, MapPin } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useBusinesses } from '@/hooks/useBusinesses';
import { supabase } from '@/integrations/supabase/client';

interface SearchResult {
  type: 'business' | 'insight' | 'recommendation';
  title: string;
  description: string;
  data?: any;
  confidence: 'high' | 'medium' | 'low';
}

const AISearch = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const { data: businesses } = useBusinesses();

  const handleSearch = async () => {
    if (!query.trim()) return;

    setIsSearching(true);
    try {
      const { data, error } = await supabase.functions.invoke('enhanced-bamabot', {
        body: {
          message: query,
          type: 'chat',
          context: {
            searchQuery: query,
            availableBusinesses: businesses?.slice(0, 10)
          }
        }
      });

      if (error) throw error;

      // Process the AI response into search results
      const searchResults: SearchResult[] = [
        {
          type: 'insight',
          title: 'AI Analysis',
          description: data.response,
          confidence: data.confidence || 'high'
        }
      ];

      // Add business matches if relevant
      if (businesses && query.toLowerCase().includes('business') || query.toLowerCase().includes('company')) {
        const relevantBusinesses = businesses
          .filter(b => 
            b.businessname.toLowerCase().includes(query.toLowerCase()) ||
            b.category?.toLowerCase().includes(query.toLowerCase()) ||
            b.description?.toLowerCase().includes(query.toLowerCase())
          )
          .slice(0, 3);

        relevantBusinesses.forEach(business => {
          searchResults.push({
            type: 'business',
            title: business.businessname,
            description: business.description || 'Alabama business',
            data: business,
            confidence: 'high'
          });
        });
      }

      setResults(searchResults);
    } catch (error) {
      console.error('Search error:', error);
      setResults([{
        type: 'insight',
        title: 'Search Error',
        description: 'Unable to process your search at the moment. Please try again.',
        confidence: 'low'
      }]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          AI-Powered Search
        </h1>
        <p className="text-gray-600">
          Search Alabama's business ecosystem with intelligent insights powered by Gemini AI
        </p>
      </div>

      <div className="flex space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about businesses, markets, trends, or opportunities in Alabama..."
            className="pl-10"
          />
        </div>
        <Button 
          onClick={handleSearch} 
          disabled={!query.trim() || isSearching}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          {isSearching ? (
            <>
              <Sparkles className="w-4 h-4 mr-2 animate-spin" />
              Searching...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Search
            </>
          )}
        </Button>
      </div>

      {results.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Search Results</h2>
          {results.map((result, index) => (
            <Card key={index} className="border-l-4 border-l-blue-500">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center space-x-2">
                    {result.type === 'business' && <Building2 className="w-5 h-5" />}
                    {result.type === 'insight' && <TrendingUp className="w-5 h-5" />}
                    {result.type === 'recommendation' && <Sparkles className="w-5 h-5" />}
                    <span>{result.title}</span>
                  </CardTitle>
                  <Badge 
                    className={
                      result.confidence === 'high' ? 'bg-green-500' :
                      result.confidence === 'medium' ? 'bg-yellow-500' : 'bg-gray-500'
                    }
                  >
                    {result.confidence} confidence
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-3">{result.description}</p>
                {result.data && result.type === 'business' && (
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center">
                      <MapPin className="w-3 h-3 mr-1" />
                      {result.data.location}
                    </div>
                    <div className="flex items-center">
                      <Building2 className="w-3 h-3 mr-1" />
                      {result.data.category}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {query && results.length === 0 && !isSearching && (
        <Card className="text-center p-8">
          <CardContent>
            <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No results found. Try a different search term or ask about Alabama businesses, trends, or opportunities.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AISearch;
