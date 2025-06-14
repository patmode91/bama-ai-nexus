
import { useState } from 'react';
import { Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import FilterPanel from './FilterPanel';
import ActiveFilters from './ActiveFilters';
import { SearchFilters } from '@/types/search';

interface AdvancedSearchProps {
  onSearch: (query: string, filters: SearchFilters) => void;
  onClearSearch: () => void;
}

const AdvancedSearch = ({ onSearch, onClearSearch }: AdvancedSearchProps) => {
  const [query, setQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    category: '',
    location: '',
    employeeRange: '',
    foundedYearRange: '',
    verified: null,
    tags: [],
    projectBudgetRange: ''
  });

  const handleSearch = () => {
    onSearch(query, filters);
  };

  const handleClearAll = () => {
    setQuery('');
    setFilters({
      category: '',
      location: '',
      employeeRange: '',
      foundedYearRange: '',
      verified: null,
      tags: [],
      projectBudgetRange: ''
    });
    onClearSearch();
  };

  const updateFilter = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const hasActiveFilters = Object.values(filters).some(value => 
    value !== '' && value !== null && (Array.isArray(value) ? value.length > 0 : true)
  );

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardContent className="p-6">
        <div className="flex flex-col gap-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search businesses, services, or keywords..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-10 bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
              {hasActiveFilters && (
                <Badge variant="secondary" className="ml-2 bg-[#00C2FF] text-white">
                  Active
                </Badge>
              )}
            </Button>
            <Button onClick={handleSearch} className="bg-[#00C2FF] hover:bg-[#00A8D8]">
              Search
            </Button>
          </div>

          {showFilters && (
            <FilterPanel 
              filters={filters}
              updateFilter={updateFilter}
              onClearAll={handleClearAll}
            />
          )}

          <ActiveFilters filters={filters} />
        </div>
      </CardContent>
    </Card>
  );
};

export default AdvancedSearch;
