
import { Badge } from '@/components/ui/badge';
import { MapPin, Users, Calendar, DollarSign, Tag } from 'lucide-react';
import { SearchFilters } from '@/types/search';

interface ActiveFiltersProps {
  filters: SearchFilters;
}

const ActiveFilters = ({ filters }: ActiveFiltersProps) => {
  const hasActiveFilters = Object.values(filters).some(value => 
    value !== '' && value !== null && (Array.isArray(value) ? value.length > 0 : true)
  );

  if (!hasActiveFilters) {
    return null;
  }

  return (
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
      {filters.projectBudgetRange && (
        <Badge variant="outline" className="border-[#00C2FF] text-[#00C2FF]">
          <DollarSign className="w-3 h-3 mr-1" />
          {filters.projectBudgetRange}
        </Badge>
      )}
      {filters.tags.map(tag => (
         <Badge key={tag} variant="outline" className="border-[#00C2FF] text-[#00C2FF]">
          <Tag className="w-3 h-3 mr-1" />
          {tag}
        </Badge>
      ))}
      {filters.verified !== null && (
        <Badge variant="outline" className="border-[#00C2FF] text-[#00C2FF]">
          {filters.verified ? 'Verified' : 'Unverified'}
        </Badge>
      )}
    </div>
  );
};

export default ActiveFilters;
