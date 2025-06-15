
import { Badge } from '@/components/ui/badge';
import { Star } from 'lucide-react';
import BusinessCard from '@/components/business/BusinessCard';

interface MatchResultCardProps {
  match: {
    business: any;
    matchScore: number;
    confidenceLevel: string;
    matchReasons: string[];
    recommendations: string[];
  };
  onViewProfile: (businessId: number) => void;
  onCompareToggle: (businessId: number) => void;
}

const MatchResultCard = ({ match, onViewProfile, onCompareToggle }: MatchResultCardProps) => {
  const getConfidenceBadgeColor = (confidence: string) => {
    switch (confidence) {
      case 'high': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="border rounded-lg p-4 space-y-3">
      <div className="flex items-start justify-between">
        <BusinessCard 
          business={match.business}
          onViewProfile={onViewProfile}
          onCompareToggle={onCompareToggle}
          isCompared={false}
          isCompareDisabled={false}
        />
        <div className="text-right space-y-1">
          <Badge className="bg-purple-500 text-white">
            {match.matchScore}% Match
          </Badge>
          <Badge className={`${getConfidenceBadgeColor(match.confidenceLevel)} text-white`}>
            {match.confidenceLevel} confidence
          </Badge>
        </div>
      </div>
      
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="text-sm font-medium text-gray-700">
            Match Reasons:
          </div>
          <div className="flex flex-wrap gap-1">
            {match.matchReasons.map((reason: string, reasonIndex: number) => (
              <Badge key={reasonIndex} variant="secondary" className="text-xs">
                {reason}
              </Badge>
            ))}
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="text-sm font-medium text-gray-700">
            Recommendations:
          </div>
          <ul className="text-xs text-gray-600 space-y-1">
            {match.recommendations.map((rec: string, recIndex: number) => (
              <li key={recIndex} className="flex items-start gap-1">
                <Star className="w-3 h-3 mt-0.5 text-yellow-500 flex-shrink-0" />
                {rec}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default MatchResultCard;
