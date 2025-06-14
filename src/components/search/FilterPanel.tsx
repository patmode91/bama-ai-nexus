
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { SearchFilters } from '@/types/search';
import FilterSelect from './FilterSelect';
import TagInput from './TagInput';


interface FilterPanelProps {
  filters: SearchFilters;
  updateFilter: (key: keyof SearchFilters, value: any) => void;
  onClearAll: () => void;
}

const FilterPanel = ({ filters, updateFilter, onClearAll }: FilterPanelProps) => {
  const categories = ['Technology', 'Healthcare', 'Manufacturing', 'Finance', 'Retail', 'Education', 'Real Estate', 'Transportation', 'Agriculture', 'Energy'];
  const locations = ['Mobile', 'Baldwin County', 'Birmingham', 'Huntsville', 'Montgomery', 'Tuscaloosa', 'Auburn', 'Madison', 'Hoover', 'Dothan', 'Decatur', 'Florence', 'Gadsden', 'Prattville', 'Vestavia Hills'];
  const employeeRanges = ['1-10', '11-50', '51-200', '201-500', '500+'];
  const foundedYearRanges = ['2020-2024', '2015-2019', '2010-2014', '2000-2009', 'Before 2000'];
  const projectBudgetRanges = ['<$10k', '$10k-$50k', '$50k-$100k', '$100k-$250k', '>$250k'];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t border-gray-700">
      <FilterSelect
        label="Category"
        value={filters.category}
        onValueChange={(value) => updateFilter('category', value)}
        placeholder="All Categories"
        items={categories.map(c => ({ value: c, label: c }))}
      />
      <FilterSelect
        label="Location"
        value={filters.location}
        onValueChange={(value) => updateFilter('location', value)}
        placeholder="All Locations"
        items={locations.map(l => ({ value: l, label: l }))}
      />
      <FilterSelect
        label="Company Size"
        value={filters.employeeRange}
        onValueChange={(value) => updateFilter('employeeRange', value)}
        placeholder="All Sizes"
        items={employeeRanges.map(r => ({ value: r, label: `${r} employees` }))}
      />
      <FilterSelect
        label="Founded"
        value={filters.foundedYearRange}
        onValueChange={(value) => updateFilter('foundedYearRange', value)}
        placeholder="Any Time"
        items={foundedYearRanges.map(r => ({ value: r, label: r }))}
      />
      
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

      <FilterSelect
        label="Project Budget"
        value={filters.projectBudgetRange}
        onValueChange={(value) => updateFilter('projectBudgetRange', value)}
        placeholder="Any Budget"
        items={projectBudgetRanges.map(r => ({ value: r, label: r }))}
      />
      
      <TagInput
        label="Tags / Certifications"
        tags={filters.tags}
        onTagsChange={(newTags) => updateFilter('tags', newTags)}
      />

      <div className="flex items-end">
        <Button
          variant="outline"
          onClick={onClearAll}
          className="w-full border-gray-600 text-gray-300 hover:bg-gray-700"
        >
          Clear All Filters
        </Button>
      </div>
    </div>
  );
};

export default FilterPanel;
