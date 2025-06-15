import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  MapPin, 
  Phone, 
  Globe, 
  Star, 
  ArrowLeft, 
  Users,
  Calendar,
  DollarSign,
  Building
} from 'lucide-react';
import Header from '@/components/sections/Header';
import Footer from '@/components/sections/Footer';
import BusinessReviews from '@/components/reviews/BusinessReviews';
import VerificationBadge from '@/components/verification/VerificationBadge';
import { useBusinesses } from '@/hooks/useBusinesses';
import { useTrackEvent } from '@/hooks/useAnalytics';
import { toast } from 'sonner';

const BusinessProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [business, setBusiness] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { getBusiness } = useBusinesses();
  const trackEvent = useTrackEvent();

  useEffect(() => {
    const loadBusiness = async () => {
      if (!id) return;
      
      try {
        const businessData = await getBusiness(parseInt(id));
        setBusiness(businessData);
        
        // Track page view
        trackEvent('business_profile_viewed', { businessId: parseInt(id) });
      } catch (error) {
        console.error('Error loading business:', error);
        toast.error('Failed to load business profile');
      } finally {
        setIsLoading(false);
      }
    };

    loadBusiness();
  }, [id, getBusiness, trackEvent]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="py-8">
          <div className="container mx-auto px-6">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="h-64 bg-gray-200 rounded mb-6"></div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="h-48 bg-gray-200 rounded"></div>
                <div className="h-48 bg-gray-200 rounded"></div>
                <div className="h-48 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="py-8">
          <div className="container mx-auto px-6 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Business Not Found</h1>
            <p className="text-gray-600 mb-6">The business you're looking for doesn't exist.</p>
            <Button onClick={() => navigate('/')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Directory
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-5 h-5 ${
          i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>{business.businessname} - Alabama Business Directory</title>
        <meta name="description" content={business.description || `Learn more about ${business.businessname} in Alabama.`} />
      </Helmet>
      
      <Header />
      
      <main className="py-8">
        <div className="container mx-auto px-6">
          <Button 
            variant="outline" 
            className="mb-6"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          {/* Business Header */}
          <Card className="mb-8">
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <CardTitle className="text-3xl">{business.businessname}</CardTitle>
                    <VerificationBadge isVerified={business.verified} />
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
            </CardContent>
          </Card>

          {/* Additional Info Cards */}
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

          {/* Reviews Section */}
          <BusinessReviews businessId={business.id} />
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default BusinessProfile;
