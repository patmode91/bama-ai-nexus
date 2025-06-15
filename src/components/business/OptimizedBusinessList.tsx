
import React, { useMemo, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  MapPin, 
  Star, 
  Users, 
  ExternalLink,
  Heart,
  HeartIcon
} from 'lucide-react';
import { Business } from '@/hooks/useBusinesses';
import { logger } from '@/services/loggerService';
import { usePerformanceOptimized } from '@/hooks/usePerformanceOptimized';

interface OptimizedBusinessListProps {
  businesses: Business[];
  isLoading: boolean;
  onViewProfile: (id: number) => void;
  onToggleFavorite?: (id: number) => void;
  favorites?: number[];
  className?: string;
}

const BusinessCard = React.memo(({ 
  business, 
  onViewProfile, 
  onToggleFavorite,
  isFavorite 
}: { 
  business: Business;
  onViewProfile: (id: number) => void;
  onToggleFavorite?: (id: number) => void;
  isFavorite: boolean;
}) => {
  const { trackError } = usePerformanceOptimized(`BusinessCard-${business.id}`);

  const handleViewProfile = useCallback(() => {
    try {
      onViewProfile(business.id);
      logger.info('Business profile viewed', { businessId: business.id }, 'BusinessCard');
    } catch (error) {
      trackError(error as Error);
    }
  }, [business.id, onViewProfile, trackError]);

  const handleToggleFavorite = useCallback(() => {
    try {
      onToggleFavorite?.(business.id);
      logger.info('Business favorite toggled', { 
        businessId: business.id, 
        isFavorite: !isFavorite 
      }, 'BusinessCard');
    } catch (error) {
      trackError(error as Error);
    }
  }, [business.id, onToggleFavorite, isFavorite, trackError]);

  return (
    <Card className="bg-gray-800 border-gray-700 hover:border-gray-600 transition-all duration-200 group">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-semibold text-white group-hover:text-blue-400 transition-colors">
                {business.businessname || 'Unnamed Business'}
              </h3>
              {business.verified && (
                <Badge variant="default" className="bg-green-600 text-white">
                  Verified
                </Badge>
              )}
            </div>
            
            {business.category && (
              <Badge variant="outline" className="text-gray-300 border-gray-600 mb-2">
                {business.category}
              </Badge>
            )}
          </div>

          {onToggleFavorite && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleToggleFavorite}
              className="text-gray-400 hover:text-red-400"
            >
              {isFavorite ? (
                <Heart className="w-4 h-4 fill-current text-red-400" />
              ) : (
                <HeartIcon className="w-4 h-4" />
              )}
            </Button>
          )}
        </div>

        {business.description && (
          <p className="text-gray-300 text-sm mb-4 line-clamp-2">
            {business.description}
          </p>
        )}

        <div className="space-y-2 mb-4">
          {business.location && (
            <div className="flex items-center text-sm text-gray-400">
              <MapPin className="w-4 h-4 mr-2" />
              {business.location}
            </div>
          )}

          {business.employees_count && (
            <div className="flex items-center text-sm text-gray-400">
              <Users className="w-4 h-4 mr-2" />
              {business.employees_count} employees
            </div>
          )}

          {business.rating && (
            <div className="flex items-center text-sm text-gray-400">
              <Star className="w-4 h-4 mr-2 fill-yellow-400 text-yellow-400" />
              {Number(business.rating).toFixed(1)}
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Button 
            onClick={handleViewProfile}
            className="flex-1 bg-blue-600 hover:bg-blue-500"
          >
            View Profile
            <ExternalLink className="w-4 h-4 ml-2" />
          </Button>

          {business.website && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(business.website!, '_blank')}
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              Website
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
});

BusinessCard.displayName = 'BusinessCard';

export const OptimizedBusinessList: React.FC<OptimizedBusinessListProps> = ({
  businesses,
  isLoading,
  onViewProfile,
  onToggleFavorite,
  favorites = [],
  className = ''
}) => {
  const { performanceData } = usePerformanceOptimized('OptimizedBusinessList');

  const renderedBusinesses = useMemo(() => {
    return businesses.map(business => (
      <BusinessCard
        key={business.id}
        business={business}
        onViewProfile={onViewProfile}
        onToggleFavorite={onToggleFavorite}
        isFavorite={favorites.includes(business.id)}
      />
    ));
  }, [businesses, onViewProfile, onToggleFavorite, favorites]);

  if (isLoading) {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>
        {Array.from({ length: 6 }).map((_, index) => (
          <Card key={index} className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <div className="space-y-4">
                <Skeleton className="h-6 w-3/4 bg-gray-700" />
                <Skeleton className="h-4 w-1/2 bg-gray-700" />
                <div className="space-y-2">
                  <Skeleton className="h-3 w-full bg-gray-700" />
                  <Skeleton className="h-3 w-2/3 bg-gray-700" />
                </div>
                <Skeleton className="h-10 w-full bg-gray-700" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (businesses.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-4">
          <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium mb-2">No businesses found</h3>
          <p className="text-sm">Try adjusting your search criteria or filters.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Performance indicator for development */}
      {import.meta.env.DEV && !performanceData.isOptimal && (
        <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-4">
          <h4 className="text-yellow-400 font-medium mb-2">Performance Warning</h4>
          <ul className="text-sm text-yellow-200 space-y-1">
            {performanceData.warnings.map((warning, index) => (
              <li key={index}>• {warning}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {renderedBusinesses}
      </div>
    </div>
  );
};

export default OptimizedBusinessList;
