
import { useState } from 'react';
import { Search, Filter, MapPin, Building2, Users, Calendar } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface AdvancedSearchProps {
  onSearch: (query: string, filters: SearchFilters) => void;
  onClearSearch: () => void;
}

interface SearchFilters {
  category: string;
  location: string;
  employeeRange: string;
  foundedYearRange: string;
  verified: boolean | null;
  tags: string[];
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
    tags: []
  });

  const categories = [
    'Technology', 'Healthcare', 'Manufacturing', 'Finance', 'Retail',
    'Education', 'Real Estate', 'Transportation', 'Agriculture', 'Energy'
  ];

  const locations = [
    'Mobile', 'Baldwin County', 'Birmingham', 'Huntsville', 'Montgomery',
    'Tuscaloosa', 'Auburn', 'Madison', 'Hoover', 'Dothan'
  ];

  const employeeRanges = [
    '1-10', '11-50', '51-200', '201-500', '500+'
  ];

  const foundedYearRanges = [
    '2020-2024', '2015-2019', '2010-2014', '2000-2009', 'Before 2000'
  ];

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
      tags: []
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
          {/* Main Search Bar */}
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

          {/* Advanced Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t border-gray-700">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Category</label>
                <Select value={filters.category} onValueChange={(value) => updateFilter('category', value)}>
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-700 border-gray-600">
                    <SelectItem value="">All Categories</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Location</label>
                <Select value={filters.location} onValueChange={(value) => updateFilter('location', value)}>
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                    <SelectValue placeholder="All Locations" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-700 border-gray-600">
                    <SelectItem value="">All Locations</SelectItem>
                    {locations.map(location => (
                      <SelectItem key={location} value={location}>{location}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Company Size</label>
                <Select value={filters.employeeRange} onValueChange={(value) => updateFilter('employeeRange', value)}>
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                    <SelectValue placeholder="All Sizes" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-700 border-gray-600">
                    <SelectItem value="">All Sizes</SelectItem>
                    {employeeRanges.map(range => (
                      <SelectItem key={range} value={range}>{range} employees</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Founded</label>
                <Select value={filters.foundedYearRange} onValueChange={(value) => updateFilter('foundedYearRange', value)}>
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                    <SelectValue placeholder="Any Time" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-700 border-gray-600">
                    <SelectItem value="">Any Time</SelectItem>
                    {foundedYearRanges.map(range => (
                      <SelectItem key={range} value={range}>{range}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Verification</label>
                <Select 
                  value={filters.verified === null ? '' : filters.verified.toString()} 
                  onValueChange={(value) => updateFilter('verified', value === '' ? null : value === 'true')}
                >
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                    <SelectValue placeholder="All Businesses" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-700 border-gray-600">
                    <SelectItem value="">All Businesses</SelectItem>
                    <SelectItem value="true">Verified Only</SelectItem>
                    <SelectItem value="false">Unverified Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={handleClearAll}
                  className="w-full border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  Clear All Filters
                </Button>
              </div>
            </div>
          )}

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-700">
              <span className="text-sm text-gray-400">Active filters:</span>
              {filters.category && (
                <Badge variant="outline" className="border-[#00C2FF] text-[#00C2FF]">
                  {filters.category}
                </Badge>
              )}
              {filters.location && (
                <Badge variant="outline" className="border-[#00C2FF] text-[#00C2FF]">
                  <MapPin className="w-3 h-3 mr-1" />
                  {filters.location}
                </Badge>
              )}
              {filters.employeeRange && (
                <Badge variant="outline" className="border-[#00C2FF] text-[#00C2FF]">
                  <Users className="w-3 h-3 mr-1" />
                  {filters.employeeRange}
                </Badge>
              )}
              {filters.foundedYearRange && (
                <Badge variant="outline" className="border-[#00C2FF] text-[#00C2FF]">
                  <Calendar className="w-3 h-3 mr-1" />
                  {filters.foundedYearRange}
                </Badge>
              )}
              {filters.verified !== null && (
                <Badge variant="outline" className="border-[#00C2FF] text-[#00C2FF]">
                  {filters.verified ? 'Verified' : 'Unverified'}
                </Badge>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AdvancedSearch;
