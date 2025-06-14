
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building2, MapPin, Users, Calendar, Star, Heart, ExternalLink, Mail } from 'lucide-react';
import { Business } from '@/hooks/useBusinesses';
import { useSavedBusinesses } from '@/hooks/useSavedBusinesses';
import { supabase } from '@/integrations/supabase/client';

interface BusinessCardProps {
  business: Business;
  onViewProfile: (businessId: number) => void;
}

const BusinessCard = ({ business, onViewProfile }: BusinessCardProps) => {
  const [user, setUser] = useState<any>(null);
  const { isBusinessSaved, saveBusiness, unsaveBusiness, isSaving, isUnsaving } = useSavedBusinesses();

  // Check if user is logged in
  useState(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });
  });

  const handleSaveToggle = () => {
    if (!user) {
      // Could redirect to auth or show a message
      return;
    }

    if (isBusinessSaved(business.id)) {
      unsaveBusiness(business.id);
    } else {
      saveBusiness(business.id);
    }
  };

  const isProcessing = isSaving || isUnsaving;
  const isSaved = isBusinessSaved(business.id);

  return (
    <Card className="bg-gray-800 border-gray-700 hover:border-[#00C2FF] transition-all duration-300 h-full">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {business.logo_url ? (
                <img 
                  src={business.logo_url} 
                  alt={`${business.businessname} logo`}
                  className="w-8 h-8 rounded"
                />
              ) : (
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-[#00C2FF] rounded flex items-center justify-center">
                  <Building2 className="w-4 h-4 text-white" />
                </div>
              )}
              <h3 className="text-xl font-semibold text-white line-clamp-1">
                {business.businessname}
              </h3>
              {business.verified && (
                <Badge variant="secondary" className="bg-green-600 text-white">
                  ✓ Verified
                </Badge>
              )}
            </div>
            
            <p className="text-gray-300 text-sm mb-4 line-clamp-3">
              {business.description}
            </p>
          </div>
          
          {user && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSaveToggle}
              disabled={isProcessing}
              className={`ml-2 ${isSaved ? 'text-red-400 hover:text-red-300' : 'text-gray-400 hover:text-[#00C2FF]'}`}
            >
              <Heart className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
            </Button>
          )}
        </div>

        <div className="space-y-3 mb-4">
          {business.category && (
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Building2 className="w-4 h-4" />
              <span>{business.category}</span>
            </div>
          )}
          
          {business.location && (
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <MapPin className="w-4 h-4" />
              <span>{business.location}</span>
            </div>
          )}
          
          {business.employees_count && (
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Users className="w-4 h-4" />
              <span>{business.employees_count} employees</span>
            </div>
          )}
          
          {business.founded_year && (
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Calendar className="w-4 h-4" />
              <span>Founded {business.founded_year}</span>
            </div>
          )}
          
          {business.rating && business.rating > 0 && (
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Star className="w-4 h-4" />
              <span>{business.rating}/5.0</span>
            </div>
          )}
        </div>

        {business.tags && business.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {business.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs border-gray-600 text-gray-300">
                {tag}
              </Badge>
            ))}
            {business.tags.length > 3 && (
              <Badge variant="outline" className="text-xs border-gray-600 text-gray-300">
                +{business.tags.length - 3} more
              </Badge>
            )}
          </div>
        )}

        <div className="flex gap-2 pt-4 border-t border-gray-700">
          <Button 
            onClick={() => onViewProfile(business.id)}
            className="flex-1 bg-[#00C2FF] hover:bg-[#00A8D8]"
            size="sm"
          >
            View Profile
          </Button>
          
          {business.website && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(business.website, '_blank')}
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              <ExternalLink className="w-4 h-4" />
            </Button>
          )}
          
          {business.contactemail && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(`mailto:${business.contactemail}`, '_blank')}
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              <Mail className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default BusinessCard;
