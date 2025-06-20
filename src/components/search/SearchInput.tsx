
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Target, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface SearchInputProps {
  query: string;
  setQuery: (query: string) => void;
  isLoading: boolean;
  suggestions: string[];
  onSearch: () => void;
  onMatchmaking: () => void;
  onSuggestionClick: (suggestion: string) => void;
}

const SearchInput = ({
  query,
  setQuery,
  isLoading,
  suggestions,
  onSearch,
  onMatchmaking,
  onSuggestionClick
}: SearchInputProps) => {
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSearch();
      setShowSuggestions(false);
    }
  };

  return (
    <div className="relative">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input
            type="text"
            placeholder="Search for AI companies, technologies, or services..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            className="pr-4"
          />
          
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 bg-background border border-border rounded-md shadow-lg z-10 mt-1">
              <div className="p-2 space-y-1">
                {suggestions.slice(0, 6).map((suggestion, index) => (
                  <button
                    key={index}
                    className="w-full text-left px-3 py-2 hover:bg-muted rounded-sm text-sm"
                    onClick={() => {
                      onSuggestionClick(suggestion);
                      setShowSuggestions(false);
                    }}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <Button onClick={onSearch} disabled={isLoading}>
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Search className="w-4 h-4" />
          )}
          Search
        </Button>
        
        <Button onClick={onMatchmaking} disabled={isLoading} variant="outline">
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Target className="w-4 h-4" />
          )}
          AI Match
        </Button>
      </div>
      
      {query && (
        <div className="mt-3 flex flex-wrap gap-2">
          <Badge variant="secondary" className="text-xs">
            Query: {query}
          </Badge>
        </div>
      )}
    </div>
  );
};

export default SearchInput;
