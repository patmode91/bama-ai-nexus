
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Lightbulb, Target } from 'lucide-react';

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
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          placeholder="Describe what you're looking for... (e.g., 'AI companies in Birmingham for computer vision projects')"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && onSearch()}
          className="flex-1"
        />
        <Button onClick={onSearch} disabled={isLoading}>
          <Search className="w-4 h-4 mr-2" />
          Search
        </Button>
        <Button onClick={onMatchmaking} disabled={isLoading} variant="outline">
          <Target className="w-4 h-4 mr-2" />
          Find Matches
        </Button>
      </div>

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
                onClick={() => onSuggestionClick(suggestion)}
              >
                {suggestion}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchInput;
