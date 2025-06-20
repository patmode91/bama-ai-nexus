
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { MapPin, Globe, Mail, Users, Calendar, Star, Target, CheckCircle } from 'lucide-react';

interface MatchResultCardProps {
  match: {
    business: any;
    matchScore: number;
    matchReasons: string[];
    compatibility: {
      location: number;
      industry: number;
      size: number;
      technology: number;
      overall: number;
    };
    recommendations: string[];
  };
  onViewProfile: (businessId: number) => void;
  onCompareToggle: (businessId: number) => void;
}

const MatchResultCard = ({ match, onViewProfile, onCompareToggle }: MatchResultCardProps) => {
  const { business, matchScore, matchReasons, compatibility, recommendations } = match;

  return (
    <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-primary">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg">{business.businessname || business.name}</CardTitle>
              {business.verified && (
                <CheckCircle className="w-4 h-4 text-green-500" />
              )}
              <Badge variant="default" className="text-xs">
                {matchScore}% Match
              </Badge>
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
              
              {business.rating && (
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  <span>{business.rating}</span>
                </div>
              )}
            </div>
          </div>
          
          <Target className="w-5 h-5 text-primary" />
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {business.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {business.description}
          </p>
        )}
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span>Location</span>
              <span>{Math.round(compatibility.location)}%</span>
            </div>
            <Progress value={compatibility.location} className="h-1" />
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span>Industry</span>
              <span>{Math.round(compatibility.industry)}%</span>
            </div>
            <Progress value={compatibility.industry} className="h-1" />
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span>Size</span>
              <span>{Math.round(compatibility.size)}%</span>
            </div>
            <Progress value={compatibility.size} className="h-1" />
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span>Technology</span>
              <span>{Math.round(compatibility.technology)}%</span>
            </div>
            <Progress value={compatibility.technology} className="h-1" />
          </div>
        </div>
        
        {matchReasons.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-foreground">Match Reasons:</p>
            <div className="flex flex-wrap gap-1">
              {matchReasons.map((reason, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {reason}
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        {recommendations.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-foreground">Recommendations:</p>
            <ul className="text-xs text-muted-foreground space-y-1">
              {recommendations.slice(0, 2).map((rec, index) => (
                <li key={index} className="flex items-start gap-1">
                  <span className="text-primary mt-0.5">•</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        <div className="flex items-center justify-between pt-3 border-t">
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
          
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => onCompareToggle(business.id)}
            >
              Compare
            </Button>
            <Button 
              size="sm"
              onClick={() => onViewProfile(business.id)}
            >
              View Profile
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MatchResultCard;
