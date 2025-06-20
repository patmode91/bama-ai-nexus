
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Globe, Mail, Users, Calendar, Star, Verified } from 'lucide-react';

interface SearchResultCardProps {
  business: any;
  relevanceScore: number;
  matchHighlights: string[];
  onClick: () => void;
}

const SearchResultCard = ({ business, relevanceScore, matchHighlights, onClick }: SearchResultCardProps) => {
  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={onClick}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg">{business.businessname || business.name}</CardTitle>
              {business.verified && (
                <Verified className="w-4 h-4 text-blue-500" />
              )}
            </div>
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              {business.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  <span>{business.location}</span>
                </div>
              )}
              
              {business.employees_count && (
                <div className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  <span>{business.employees_count} employees</span>
                </div>
              )}
              
              {business.founded_year && (
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>Founded {business.founded_year}</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-2">
            <Badge variant="outline" className="text-xs">
              {relevanceScore}% match
            </Badge>
            
            {business.rating && (
              <div className="flex items-center gap-1 text-sm">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                <span>{business.rating}</span>
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {business.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {business.description}
          </p>
        )}
        
        {business.category && (
          <Badge variant="secondary" className="text-xs">
            {business.category}
          </Badge>
        )}
        
        {business.tags && business.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {business.tags.slice(0, 4).map((tag: string, index: number) => (
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
        
        {matchHighlights.length > 0 && (
          <div className="pt-2 border-t">
            <p className="text-xs text-muted-foreground mb-1">Match highlights:</p>
            <div className="flex flex-wrap gap-1">
              {matchHighlights.slice(0, 3).map((highlight, index) => (
                <Badge key={index} variant="default" className="text-xs">
                  {highlight}
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            {business.website && (
              <Button variant="ghost" size="sm" className="h-8 px-2">
                <Globe className="w-3 h-3" />
              </Button>
            )}
            
            {business.contactemail && (
              <Button variant="ghost" size="sm" className="h-8 px-2">
                <Mail className="w-3 h-3" />
              </Button>
            )}
          </div>
          
          <Button size="sm" variant="outline">
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SearchResultCard;
