
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, MapPin, Users, Calendar, ExternalLink, Verified } from 'lucide-react';
import { Database } from '@/integrations/supabase/types';

type Business = Database['public']['Tables']['businesses']['Row'];

interface SearchResultCardProps {
  business: Business;
  relevanceScore: number;
  matchHighlights: string[];
  onClick: () => void;
}

const SearchResultCard = ({ business, relevanceScore, matchHighlights, onClick }: SearchResultCardProps) => {
  return (
    <Card className="bg-gray-800 border-gray-700 hover:border-blue-500 transition-colors cursor-pointer" onClick={onClick}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="flex items-center space-x-2">
              <span className="text-white">{business.businessname}</span>
              {business.verified && (
                <Verified className="w-5 h-5 text-blue-400" />
              )}
            </CardTitle>
            <div className="flex items-center space-x-2 mt-1">
              <Badge variant="outline" className="text-xs">
                {business.category}
              </Badge>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="text-xs text-gray-400">
                  {relevanceScore}% match
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <Star className="w-4 h-4 text-yellow-400" />
            <span className="text-white font-medium">
              {business.rating ? Number(business.rating).toFixed(1) : 'N/A'}
            </span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <p className="text-gray-300 text-sm line-clamp-2">
          {business.description}
        </p>

        {matchHighlights.length > 0 && (
          <div className="space-y-1">
            <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wide">
              Matches
            </h4>
            <div className="flex flex-wrap gap-1">
              {matchHighlights.slice(0, 3).map((highlight, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {highlight}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 text-sm">
          {business.location && (
            <div className="flex items-center space-x-2 text-gray-400">
              <MapPin className="w-4 h-4" />
              <span>{business.location}</span>
            </div>
          )}
          
          {business.employees_count && (
            <div className="flex items-center space-x-2 text-gray-400">
              <Users className="w-4 h-4" />
              <span>{business.employees_count} employees</span>
            </div>
          )}
          
          {business.founded_year && (
            <div className="flex items-center space-x-2 text-gray-400">
              <Calendar className="w-4 h-4" />
              <span>Founded {business.founded_year}</span>
            </div>
          )}
        </div>

        {business.tags && business.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {business.tags.slice(0, 4).map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {business.tags.length > 4 && (
              <Badge variant="outline" className="text-xs">
                +{business.tags.length - 4} more
              </Badge>
            )}
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center space-x-2">
            {business.website && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(business.website, '_blank');
                }}
                className="text-blue-400 hover:text-blue-300"
              >
                <ExternalLink className="w-4 h-4 mr-1" />
                Website
              </Button>
            )}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}
            className="border-gray-600 hover:border-blue-500"
          >
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SearchResultCard;
