import { useState } from 'react';
import { useConnectorAgent } from '@/hooks/useAgent';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Search } from 'lucide-react';

interface Business {
  id: string;
  business_id: number;
  name: string;
  description: string;
  similarity: number;
  metadata?: {
    industry?: string;
    location?: string;
    [key: string]: any;
  };
}

export function BusinessSearch() {
  const [query, setQuery] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  const {
    callAgent,
    isLoading,
    error,
    response,
    reset
  } = useConnectorAgent<{ results: Business[] }>();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    setSearchQuery(query);
    await callAgent(query, {
      filters: {
        // Add any default filters here
      },
    });
  };

  const results = response?.data?.results || [];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Find Businesses</CardTitle>
          <CardDescription>
            Search for businesses using natural language. Try queries like "tech startups in Austin" or "sustainable fashion brands".
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex space-x-2">
            <Input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for businesses..."
              className="flex-1"
              disabled={isLoading}
            />
            <Button type="submit" disabled={isLoading || !query.trim()}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Search
                </>
              )}
            </Button>
          </form>

          {error && (
            <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-md">
              <p className="font-medium">Error</p>
              <p className="text-sm">{error.message}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {searchQuery && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium">
              {isLoading ? 'Searching...' : `Results for "${searchQuery}"`}
            </h2>
            {results.length > 0 && (
              <span className="text-sm text-muted-foreground">
                {results.length} {results.length === 1 ? 'result' : 'results'}
              </span>
            )}
          </div>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : results.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground">
                  {searchQuery
                    ? 'No businesses found matching your search.'
                    : 'Enter a search query to find businesses.'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {results.map((business) => (
                <Card key={business.id} className="h-full flex flex-col">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{business.name}</CardTitle>
                      <Badge variant="outline" className="ml-2">
                        {Math.round(business.similarity * 100)}% match
                      </Badge>
                    </div>
                    {business.metadata?.industry && (
                      <p className="text-sm text-muted-foreground">
                        {business.metadata.industry}
                      </p>
                    )}
                  </CardHeader>
                  <CardContent className="flex-1">
                    <p className="text-sm line-clamp-3">{business.description}</p>
                  </CardContent>
                  <CardFooter className="pt-2">
                    <Button variant="outline" size="sm" className="w-full">
                      View Details
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
