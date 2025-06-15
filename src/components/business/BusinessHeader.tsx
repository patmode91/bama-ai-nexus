
import { Badge } from '@/components/ui/badge';
import { CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Star } from 'lucide-react';
import VerificationBadge from '@/components/verification/VerificationBadge';
import { Business } from '@/hooks/useBusinesses';

interface BusinessHeaderProps {
  business: Business;
}

const BusinessHeader = ({ business }: BusinessHeaderProps) => {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-5 h-5 ${
          i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-start md:justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <CardTitle className="text-3xl">{business.businessname}</CardTitle>
              <VerificationBadge businessId={business.id} isVerified={business.verified} />
            </div>
            
            {business.category && (
              <Badge variant="secondary" className="mb-4">
                {business.category}
              </Badge>
            )}
            
            {business.rating && (
              <div className="flex items-center space-x-2 mb-4">
                <div className="flex items-center">
                  {renderStars(business.rating)}
                </div>
                <span className="text-lg font-medium">({business.rating})</span>
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {business.description && (
          <p className="text-gray-700 text-lg mb-6">{business.description}</p>
        )}
      </CardContent>
    </>
  );
};

export default BusinessHeader;
