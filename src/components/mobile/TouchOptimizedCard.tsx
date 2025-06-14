
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Star, Users, Calendar, ExternalLink, Heart, Share2 } from 'lucide-react';
import { Business } from '@/hooks/useBusinesses';

interface TouchOptimizedCardProps {
  business: Business;
  onViewProfile: (id: number) => void;
  onToggleFavorite: (id: number) => void;
  onShare: (business: Business) => void;
  isFavorite: boolean;
}

const TouchOptimizedCard = ({ 
  business, 
  onViewProfile, 
  onToggleFavorite, 
  onShare, 
  isFavorite 
}: TouchOptimizedCardProps) => {
  const [isPressed, setIsPressed] = useState(false);

  const handleTouchStart = () => setIsPressed(true);
  const handleTouchEnd = () => setIsPressed(false);

  return (
    <Card 
      className={`bg-gray-900/80 backdrop-blur-sm border-gray-700 transition-all duration-200 ${
        isPressed ? 'scale-95 bg-gray-800' : 'hover:border-[#00C2FF]/50'
      }`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleTouchStart}
      onMouseUp={handleTouchEnd}
      onMouseLeave={handleTouchEnd}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold text-white mb-1">
              {business.businessname}
            </CardTitle>
            <CardDescription className="text-gray-400 text-sm">
              {business.category}
            </CardDescription>
          </div>
          
          <div className="flex space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(business.id);
              }}
              className={`p-2 ${isFavorite ? 'text-red-500' : 'text-gray-400'}`}
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onShare(business);
              }}
              className="p-2 text-gray-400"
            >
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <p className="text-gray-300 text-sm mb-4 line-clamp-2">
          {business.description}
        </p>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {business.tags?.slice(0, 3).map((tag, index) => (
            <Badge 
              key={index} 
              variant="secondary" 
              className="text-xs bg-gray-800 text-gray-300"
            >
              {tag}
            </Badge>
          ))}
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-4 text-xs text-gray-400">
          {business.location && (
            <div className="flex items-center">
              <MapPin className="w-3 h-3 mr-1" />
              <span className="truncate">{business.location}</span>
            </div>
          )}
          
          {business.rating && (
            <div className="flex items-center">
              <Star className="w-3 h-3 mr-1 text-yellow-500" />
              <span>{business.rating}/5</span>
            </div>
          )}
          
          {business.employees_count && (
            <div className="flex items-center">
              <Users className="w-3 h-3 mr-1" />
              <span>{business.employees_count} employees</span>
            </div>
          )}
          
          {business.founded_year && (
            <div className="flex items-center">
              <Calendar className="w-3 h-3 mr-1" />
              <span>Since {business.founded_year}</span>
            </div>
          )}
        </div>
        
        <Button
          onClick={() => onViewProfile(business.id)}
          className="w-full bg-[#00C2FF] hover:bg-[#0099CC] text-white py-3 text-sm font-medium"
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          View Profile
        </Button>
      </CardContent>
    </Card>
  );
};

export default TouchOptimizedCard;
