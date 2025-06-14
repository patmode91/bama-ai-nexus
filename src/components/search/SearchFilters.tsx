
import { useState } from 'react';
import { Search, Filter, MapPin, Building2, Users, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

interface SearchFiltersProps {
  onSearch: (query: string, filters: SearchFilters) => void;
  onClear: () => void;
}

interface SearchFilters {
  location: string;
  category: string;
  companySize: string;
  tags: string[];
}

const SearchFilters = ({ onSearch, onClear }: SearchFiltersProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    location: '',
    category: '',
    companySize: '',
    tags: []
  });

  const categories = [
    'AI Solutions', 'Software Development', 'IT Services', 'Web Development',
    'Digital Marketing', 'Manufacturing', 'Healthcare Technology', 'Cybersecurity',
    'Industrial Automation', 'Aerospace', 'Security Systems'
  ];

  const companySizes = ['1-10', '11-25', '26-50', '51-100', '100+'];
  const locations = ['Mobile, AL', 'Baldwin County, AL', 'Fairhope, AL', 'Daphne, AL', 'Foley, AL', 'Gulf Shores, AL'];

  const handleSearch = () => {
    onSearch(searchQuery, filters);
  };

  const handleFilterChange = (key: keyof SearchFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const addTag = (tag: string) => {
    if (!filters.tags.includes(tag)) {
      setFilters(prev => ({ ...prev, tags: [...prev.tags, tag] }));
    }
  };

  const removeTag = (tag: string) => {
    setFilters(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }));
  };

  const clearAll = () => {
    setSearchQuery('');
    setFilters({ location: '', category: '', companySize: '', tags: [] });
    onClear();
  };

  return (
    <Card className="w-full bg-gray-800 border-gray-700">
      <CardContent className="p-6">
        {/* Main Search Bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Search by company name, AI solution, or describe your problem..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-4 py-3 text-lg border-2 border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:border-[#00C2FF] rounded-full"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
            <Button 
              onClick={handleSearch}
              className="bg-[#00C2FF] hover:bg-[#00A8D8] rounded-full px-8"
            >
              Search
            </Button>
          </div>
        </div>

        {/* Quick Search Suggestions */}
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="text-sm text-gray-400">Quick search:</span>
          {['AI Solutions', 'Web Development', 'IT Services', 'Industrial Automation'].map((suggestion) => (
            <Button
              key={suggestion}
              variant="ghost"
              size="sm"
              onClick={() => setSearchQuery(suggestion)}
              className="text-xs text-[#00C2FF] hover:bg-gray-700"
            >
              {suggestion}
            </Button>
          ))}
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <div className="grid md:grid-cols-3 gap-4 pt-4 border-t border-gray-700">
            {/* Location Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <MapPin className="w-4 h-4 inline mr-1" />
                Location
              </label>
              <select
                value={filters.location}
                onChange={(e) => handleFilterChange('location', e.target.value)}
                className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white"
              >
                <option value="">All Locations</option>
                {locations.map(location => (
                  <option key={location} value={location}>{location}</option>
                ))}
              </select>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Building2 className="w-4 h-4 inline mr-1" />
                Category
              </label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            {/* Company Size Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Users className="w-4 h-4 inline mr-1" />
                Company Size
              </label>
              <select
                value={filters.companySize}
                onChange={(e) => handleFilterChange('companySize', e.target.value)}
                className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white"
              >
                <option value="">All Sizes</option>
                {companySizes.map(size => (
                  <option key={size} value={size}>{size} employees</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Active Filters */}
        {(filters.location || filters.category || filters.companySize || filters.tags.length > 0) && (
          <div className="mt-4 pt-4 border-t border-gray-700">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-gray-400">Active filters:</span>
              {filters.location && (
                <Badge variant="secondary" className="bg-[#00C2FF]/20 text-[#00C2FF] border-[#00C2FF]/30">
                  <MapPin className="w-3 h-3 mr-1" />
                  {filters.location}
                </Badge>
              )}
              {filters.category && (
                <Badge variant="secondary" className="bg-[#00C2FF]/20 text-[#00C2FF] border-[#00C2FF]/30">
                  <Building2 className="w-3 h-3 mr-1" />
                  {filters.category}
                </Badge>
              )}
              {filters.companySize && (
                <Badge variant="secondary" className="bg-[#00C2FF]/20 text-[#00C2FF] border-[#00C2FF]/30">
                  <Users className="w-3 h-3 mr-1" />
                  {filters.companySize}
                </Badge>
              )}
              {filters.tags.map(tag => (
                <Badge key={tag} variant="secondary" className="bg-[#00C2FF]/20 text-[#00C2FF] border-[#00C2FF]/30">
                  <Tag className="w-3 h-3 mr-1" />
                  {tag}
                  <button onClick={() => removeTag(tag)} className="ml-1 text-xs">×</button>
                </Badge>
              ))}
              <Button variant="ghost" size="sm" onClick={clearAll} className="text-gray-400 hover:text-white">
                Clear all
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SearchFilters;
