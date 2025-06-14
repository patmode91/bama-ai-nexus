import { MapPin, Star, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';

interface Company {
  id: number;
  businessname?: string;
  location?: string;
  description?: string;
  category?: string;
  website?: string;
  logo_url?: string;
  verified?: boolean;
  rating?: number;
  employees_count?: number;
  tags?: string[];
}

interface FeaturedCompaniesSectionProps {
  companies: Company[];
  isLoading: boolean;
  hasError: boolean;
  isFiltered: boolean;
  onViewProfile: (companyId: number) => void;
}

const FeaturedCompaniesSection = ({ 
  companies, 
  isLoading, 
  hasError, 
  isFiltered, 
  onViewProfile 
}: FeaturedCompaniesSectionProps) => {
  const navigate = useNavigate();

  const handleViewProfile = (companyId: number) => {
    navigate(`/business/${companyId}`);
  };

  const handleCardClick = (companyId: number) => {
    navigate(`/business/${companyId}`);
  };

  if (isLoading) {
    return (
      <section id="directory" className="py-16 px-6 bg-gray-800">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Loading Companies...</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <Card key={index} className="bg-gray-800 border-gray-700 animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-gray-700 rounded mb-2"></div>
                  <div className="h-4 bg-gray-700 rounded w-2/3"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-16 bg-gray-700 rounded mb-4"></div>
                  <div className="flex justify-between">
                    <div className="h-6 bg-gray-700 rounded w-1/3"></div>
                    <div className="h-6 bg-gray-700 rounded w-1/4"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (hasError) {
    return (
      <section id="directory" className="py-16 px-6 bg-gray-800">
        <div className="container mx-auto">
          <div className="text-center text-gray-400 py-8">
            <p>Unable to load companies. Please try again later.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="directory" className="py-16 px-6 bg-gray-800">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">
            {isFiltered ? 'Search Results' : 'Featured AI Companies'}
          </h2>
          <p className="text-lg text-gray-300">
            {isFiltered 
              ? `Found ${companies.length} companies matching your criteria`
              : `Showcasing ${companies.length} companies from Mobile & Baldwin counties`
            }
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {companies.map((company) => (
            <Card 
              key={company.id} 
              className="hover:shadow-lg transition-shadow cursor-pointer group bg-gray-800 border-gray-700"
              onClick={() => handleCardClick(company.id)}
            >
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">
                      {company.logo_url ? (
                        <img src={company.logo_url} alt={company.businessname} className="w-8 h-8 rounded" />
                      ) : (
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-[#00C2FF] rounded flex items-center justify-center text-white text-sm font-bold">
                          {company.businessname?.charAt(0) || 'A'}
                        </div>
                      )}
                    </div>
                    <div>
                      <CardTitle className="text-lg group-hover:text-[#00C2FF] transition-colors text-white">
                        {company.businessname || 'Unnamed Company'}
                      </CardTitle>
                      <div className="flex items-center text-sm text-gray-400 mt-1">
                        <MapPin className="w-3 h-3 mr-1" />
                        {company.location || 'Alabama'}
                      </div>
                    </div>
                  </div>
                  {company.verified && (
                    <div className="flex items-center text-sm text-gray-300">
                      <Star className="w-4 h-4 text-yellow-400 mr-1" />
                      {company.rating || 4.5}
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 text-sm mb-4 leading-relaxed line-clamp-3">
                  {company.description || 'AI solutions provider in Alabama'}
                </p>
                <div className="flex items-center justify-between mb-3">
                  <Badge variant="secondary" className="text-xs bg-gray-700 text-gray-300">
                    {company.category || 'AI Services'}
                  </Badge>
                  {company.employees_count && (
                    <Badge variant="outline" className="text-xs border-gray-600 text-gray-400">
                      {company.employees_count} employees
                    </Badge>
                  )}
                </div>
                {company.tags && company.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {company.tags.slice(0, 3).map((tag: string, index: number) => (
                      <Badge key={index} variant="outline" className="text-xs border-[#00C2FF]/30 text-[#00C2FF] px-2 py-1">
                        {tag}
                      </Badge>
                    ))}
                    {company.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs border-gray-600 text-gray-400 px-2 py-1">
                        +{company.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                )}
                <div className="flex justify-between items-center">
                  {company.website && (
                    <a 
                      href={company.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-xs text-[#00C2FF] hover:text-[#00A8D8] underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Visit Website
                    </a>
                  )}
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-[#00C2FF] hover:text-[#00A8D8] hover:bg-gray-700" 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewProfile(company.id);
                    }}
                  >
                    View Profile
                    <ArrowRight className="w-3 h-3 ml-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="text-center mt-8">
          <Button variant="outline" size="lg" className="border-[#00C2FF] text-[#00C2FF] hover:bg-[#00C2FF] hover:text-white">
            Browse All Companies
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedCompaniesSection;
