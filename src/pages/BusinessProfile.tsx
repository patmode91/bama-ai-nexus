
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Globe, Mail, Phone, MapPin, Users, Calendar, Star, ExternalLink, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useBusinesses } from '@/hooks/useBusinesses';
import Header from '@/components/sections/Header';
import Footer from '@/components/sections/Footer';

const BusinessProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: businesses, isLoading } = useBusinesses();
  
  const business = businesses?.find(b => b.id === parseInt(id || ''));

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-700 to-gray-800">
        <Header onSignIn={() => {}} />
        <div className="container mx-auto px-6 py-16">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-700 rounded mb-4 w-1/3"></div>
            <div className="h-32 bg-gray-700 rounded mb-6"></div>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-6">
                <div className="h-48 bg-gray-700 rounded"></div>
                <div className="h-32 bg-gray-700 rounded"></div>
              </div>
              <div className="space-y-4">
                <div className="h-24 bg-gray-700 rounded"></div>
                <div className="h-24 bg-gray-700 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-700 to-gray-800">
        <Header onSignIn={() => {}} />
        <div className="container mx-auto px-6 py-16">
          <div className="text-center">
            <Building2 className="w-24 h-24 text-gray-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-white mb-2">Business Not Found</h1>
            <p className="text-gray-400 mb-6">The business you're looking for doesn't exist or has been removed.</p>
            <Button onClick={() => navigate('/')} className="bg-[#00C2FF] hover:bg-[#00A8D8]">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Directory
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-700 to-gray-800">
      <Header onSignIn={() => {}} />
      
      {/* Hero Section */}
      <section className="py-16 px-6">
        <div className="container mx-auto">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="text-gray-300 hover:text-white mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Directory
          </Button>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="md:col-span-2">
              <div className="flex items-start space-x-4 mb-6">
                <div className="text-4xl">
                  {business.logo_url ? (
                    <img src={business.logo_url} alt={business.businessname} className="w-16 h-16 rounded-lg object-cover" />
                  ) : (
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-[#00C2FF] rounded-lg flex items-center justify-center text-white text-xl font-bold">
                      {business.businessname?.charAt(0) || 'A'}
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-bold text-white">{business.businessname}</h1>
                    {business.verified && (
                      <Badge className="bg-yellow-400/20 text-yellow-400 border-yellow-400/30">
                        <Star className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center text-gray-400 mb-2">
                    <MapPin className="w-4 h-4 mr-2" />
                    {business.location || 'Alabama'}
                  </div>
                  <Badge variant="secondary" className="bg-gray-700 text-gray-300">
                    {business.category || 'AI Services'}
                  </Badge>
                </div>
              </div>

              {/* Description */}
              <Card className="bg-gray-800 border-gray-700 mb-6">
                <CardHeader>
                  <CardTitle className="text-white">About</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300 leading-relaxed">
                    {business.description || 'This company provides innovative AI solutions and services in Alabama.'}
                  </p>
                </CardContent>
              </Card>

              {/* Tags */}
              {business.tags && business.tags.length > 0 && (
                <Card className="bg-gray-800 border-gray-700 mb-6">
                  <CardHeader>
                    <CardTitle className="text-white">Specializations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {business.tags.map((tag: string, index: number) => (
                        <Badge key={index} variant="outline" className="border-[#00C2FF]/30 text-[#00C2FF]">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Contact Information */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {business.contactemail && (
                    <div className="flex items-center space-x-3">
                      <Mail className="w-4 h-4 text-[#00C2FF]" />
                      <a href={`mailto:${business.contactemail}`} className="text-gray-300 hover:text-[#00C2FF] transition-colors">
                        {business.contactemail}
                      </a>
                    </div>
                  )}
                  {business.website && (
                    <div className="flex items-center space-x-3">
                      <Globe className="w-4 h-4 text-[#00C2FF]" />
                      <a 
                        href={business.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-gray-300 hover:text-[#00C2FF] transition-colors flex items-center"
                      >
                        Visit Website
                        <ExternalLink className="w-3 h-3 ml-1" />
                      </a>
                    </div>
                  )}
                  {business.contactname && (
                    <div className="flex items-center space-x-3">
                      <Users className="w-4 h-4 text-[#00C2FF]" />
                      <span className="text-gray-300">{business.contactname}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Company Details */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Company Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {business.employees_count && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Team Size</span>
                      <span className="text-white">{business.employees_count} employees</span>
                    </div>
                  )}
                  {business.founded_year && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Founded</span>
                      <span className="text-white">{business.founded_year}</span>
                    </div>
                  )}
                  {business.rating && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Rating</span>
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-400 mr-1" />
                        <span className="text-white">{business.rating}</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="space-y-3">
                {business.contactemail && (
                  <Button className="w-full bg-[#00C2FF] hover:bg-[#00A8D8]">
                    <Mail className="w-4 h-4 mr-2" />
                    Contact Business
                  </Button>
                )}
                <Button variant="outline" className="w-full border-gray-600 text-gray-300 hover:bg-gray-700">
                  <Star className="w-4 h-4 mr-2" />
                  Save to Favorites
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default BusinessProfile;
