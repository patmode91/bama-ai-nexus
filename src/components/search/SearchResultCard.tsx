
import { Badge } from '@/components/ui/badge';
import BusinessCard from '@/components/business/BusinessCard';

interface SearchResultCardProps {
  result: {
    business: any;
    relevanceScore: number;
    matchingReasons: string[];
  };
  onViewProfile: (businessId: number) => void;
  onCompareToggle: (businessId: number) => void;
}

const SearchResultCard = ({ result, onViewProfile, onCompareToggle }: SearchResultCardProps) => {
  return (
    <div className="border rounded-lg p-4 space-y-3">
      <div className="flex items-start justify-between">
        <BusinessCard 
          business={result.business}
          onViewProfile={onViewProfile}
          onCompareToggle={onCompareToggle}
          isCompared={false}
          isCompareDisabled={false}
        />
        <div className="text-right space-y-1">
          <Badge className="bg-blue-500 text-white">
            {result.relevanceScore}% Match
          </Badge>
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="text-sm font-medium text-gray-700">
          Matching Reasons:
        </div>
        <div className="flex flex-wrap gap-1">
          {result.matchingReasons.map((reason: string, reasonIndex: number) => (
            <Badge key={reasonIndex} variant="secondary" className="text-xs">
              {reason}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SearchResultCard;
