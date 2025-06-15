
import { MapPin, Phone, Globe, Users } from 'lucide-react';
import { Business } from '@/hooks/useBusinesses';

interface BusinessContactProps {
  business: Business;
}

const BusinessContact = ({ business }: BusinessContactProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {business.location && (
        <div className="flex items-center text-gray-600">
          <MapPin className="w-5 h-5 mr-2" />
          <span>{business.location}</span>
        </div>
      )}
      
      {business.phone && (
        <div className="flex items-center text-gray-600">
          <Phone className="w-5 h-5 mr-2" />
          <a href={`tel:${business.phone}`} className="hover:text-blue-600">
            {business.phone}
          </a>
        </div>
      )}
      
      {business.website && (
        <div className="flex items-center text-gray-600">
          <Globe className="w-5 h-5 mr-2" />
          <a 
            href={business.website} 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:text-blue-600"
          >
            Visit Website
          </a>
        </div>
      )}
      
      {business.employees_count && (
        <div className="flex items-center text-gray-600">
          <Users className="w-5 h-5 mr-2" />
          <span>{business.employees_count} employees</span>
        </div>
      )}
    </div>
  );
};

export default BusinessContact;
