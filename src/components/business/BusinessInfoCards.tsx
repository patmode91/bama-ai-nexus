
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, DollarSign, Building } from 'lucide-react';
import { Business } from '@/hooks/useBusinesses';

interface BusinessInfoCardsProps {
  business: Business;
}

const BusinessInfoCards = ({ business }: BusinessInfoCardsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {business.founded_year && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Established
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-600">{business.founded_year}</p>
          </CardContent>
        </Card>
      )}
      
      {business.annual_revenue && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center">
              <DollarSign className="w-5 h-5 mr-2" />
              Annual Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">${business.annual_revenue}</p>
          </CardContent>
        </Card>
      )}
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center">
            <Building className="w-5 h-5 mr-2" />
            Business Type
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg">{business.category || 'General Business'}</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default BusinessInfoCards;
