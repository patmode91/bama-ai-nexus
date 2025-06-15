
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Header from '@/components/sections/Header';
import Footer from '@/components/sections/Footer';
import BusinessReviews from '@/components/reviews/BusinessReviews';
import BusinessHeader from '@/components/business/BusinessHeader';
import BusinessContact from '@/components/business/BusinessContact';
import BusinessInfoCards from '@/components/business/BusinessInfoCards';
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
            <BusinessHeader business={business} />
            <div className="px-6 pb-6">
              <BusinessContact business={business} />
            </div>
          </Card>

          {/* Additional Info Cards */}
          <BusinessInfoCards business={business} />

          {/* Reviews Section */}
          <BusinessReviews businessId={business.id} />
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default BusinessProfile;
