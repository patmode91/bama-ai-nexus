
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Phone, Globe, Star, Heart, Share2, Eye } from 'lucide-react';
import { Business } from '@/types/business';
import { useTrackEvent } from '@/hooks/useAnalytics';

interface BusinessCardProps {
  business: Business;
  onSave?: (businessId: number) => void;
  onShare?: (business: Business) => void;
  onView?: (business: Business) => void;
  onViewProfile?: (businessId: number) => void;
  onCompareToggle?: (businessId: number) => void;
  isCompared?: boolean;
  isSaved?: boolean;
  isCompareDisabled?: boolean;
}

const BusinessCard = ({ 
  business, 
  onSave, 
  onShare, 
  onView, 
  onViewProfile,
  onCompareToggle,
  isCompared = false,
  isSaved = false,
  isCompareDisabled = false
}: BusinessCardProps) => {
  const trackEvent = useTrackEvent();

  const handleSave = () => {
    if (onSave) {
      onSave(business.id);
      trackEvent('business_saved', { businessId: business.id, businessName: business.businessname });
    }
  };

  const handleShare = () => {
    if (onShare) {
      onShare(business);
      trackEvent('business_shared', { businessId: business.id, businessName: business.businessname });
    }
  };

  const handleView = () => {
    if (onView) {
      onView(business);
    } else if (onViewProfile) {
      onViewProfile(business.id);
    }
    trackEvent('business_viewed', { businessId: business.id, businessName: business.businessname });
  };

  const handleCompareToggle = () => {
    if (onCompareToggle && !isCompareDisabled) {
      onCompareToggle(business.id);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <Card className="h-full hover:shadow-lg transition-shadow duration-300">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg mb-2">{business.businessname}</CardTitle>
            {business.category && (
              <Badge variant="secondary" className="mb-2">
                {business.category}
              </Badge>
            )}
          </div>
          {business.verified && (
            <Badge className="bg-green-500 text-white">
              Verified
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Rating */}
        {business.rating && (
          <div className="flex items-center space-x-1">
            {renderStars(business.rating)}
            <span className="text-sm text-gray-600 ml-2">({business.rating})</span>
          </div>
        )}

        {/* Description */}
        {business.description && (
          <p className="text-gray-600 text-sm line-clamp-2">
            {business.description}
          </p>
        )}

        {/* Contact Info */}
        <div className="space-y-2">
          {business.location && (
            <div className="flex items-center text-sm text-gray-600">
              <MapPin className="w-4 h-4 mr-2" />
              {business.location}
            </div>
          )}
          
          {business.phone && (
            <div className="flex items-center text-sm text-gray-600">
              <Phone className="w-4 h-4 mr-2" />
              {business.phone}
            </div>
          )}
          
          {business.website && (
            <div className="flex items-center text-sm text-gray-600">
              <Globe className="w-4 h-4 mr-2" />
              <a 
                href={business.website} 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-blue-600 transition-colors"
              >
                Website
              </a>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center pt-4 border-t">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleView}
            className="flex items-center"
          >
            <Eye className="w-4 h-4 mr-1" />
            View
          </Button>
          
          <div className="flex space-x-2">
            {onCompareToggle && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCompareToggle}
                disabled={isCompareDisabled}
                className={`flex items-center ${isCompared ? 'text-blue-500' : ''}`}
              >
                <Star className={`w-4 h-4 mr-1 ${isCompared ? 'fill-current' : ''}`} />
                {isCompared ? 'Added' : 'Compare'}
              </Button>
            )}
            
            {onSave && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSave}
                className={`flex items-center ${isSaved ? 'text-red-500' : ''}`}
              >
                <Heart className={`w-4 h-4 mr-1 ${isSaved ? 'fill-current' : ''}`} />
                {isSaved ? 'Saved' : 'Save'}
              </Button>
            )}
            
            {onShare && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleShare}
                className="flex items-center"
              >
                <Share2 className="w-4 h-4 mr-1" />
                Share
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BusinessCard;
