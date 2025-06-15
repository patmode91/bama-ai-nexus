
import { ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Star, Phone, Globe, Clock } from 'lucide-react';

interface TouchOptimizedCardProps {
  business: {
    id: number;
    name: string;
    description?: string;
    category: string;
    location: string;
    rating?: number;
    phone?: string;
    website?: string;
    hours?: string;
  };
  onTap: (businessId: number) => void;
  onCall?: (phone: string) => void;
  onWebsite?: (website: string) => void;
}

const TouchOptimizedCard = ({ business, onTap, onCall, onWebsite }: TouchOptimizedCardProps) => {
  const handleMainTap = () => {
    onTap(business.id);
  };

  const handleCallTap = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (business.phone && onCall) {
      onCall(business.phone);
    }
  };

  const handleWebsiteTap = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (business.website && onWebsite) {
      onWebsite(business.website);
    }
  };

  return (
    <Card 
      className="bg-gray-900/80 backdrop-blur-sm border-gray-700 hover:border-[#00C2FF]/50 transition-all duration-200 cursor-pointer touch-manipulation active:scale-95"
      onClick={handleMainTap}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-white text-lg leading-tight mb-1">
              {business.name}
            </CardTitle>
            <div className="flex items-center space-x-2 mb-2">
              <Badge variant="secondary" className="text-xs">
                {business.category}
              </Badge>
              {business.rating && (
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 fill-current text-yellow-500" />
                  <span className="text-sm text-gray-300">{business.rating}</span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {business.description && (
          <CardDescription className="text-gray-300 line-clamp-2">
            {business.description}
          </CardDescription>
        )}
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div className="flex items-center text-sm text-gray-400">
            <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
            <span className="truncate">{business.location}</span>
          </div>
          
          {business.hours && (
            <div className="flex items-center text-sm text-gray-400">
              <Clock className="w-4 h-4 mr-2 flex-shrink-0" />
              <span className="truncate">{business.hours}</span>
            </div>
          )}
          
          <div className="flex space-x-2 pt-2">
            {business.phone && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleCallTap}
                className="flex-1 border-gray-600 text-gray-300 hover:bg-green-600 hover:border-green-600 touch-manipulation min-h-[44px]"
              >
                <Phone className="w-4 h-4 mr-1" />
                Call
              </Button>
            )}
            
            {business.website && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleWebsiteTap}
                className="flex-1 border-gray-600 text-gray-300 hover:bg-blue-600 hover:border-blue-600 touch-manipulation min-h-[44px]"
              >
                <Globe className="w-4 h-4 mr-1" />
                Visit
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TouchOptimizedCard;
