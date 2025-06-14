
import BusinessCard from '@/components/business/BusinessCard';
import { Business } from '@/hooks/useBusinesses';

interface FeaturedCompaniesSectionProps {
  companies: Business[];
  isLoading: boolean;
  hasError: boolean;
  isFiltered: boolean;
  onViewProfile: (businessId: number) => void;
}

const FeaturedCompaniesSection = ({ 
  companies, 
  isLoading, 
  hasError, 
  isFiltered,
  onViewProfile 
}: FeaturedCompaniesSectionProps) => {
  if (hasError) {
    return (
      <section id="directory" className="py-16 px-6 bg-gray-800">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-4">Error Loading Directory</h2>
            <p className="text-gray-300">
              There was an issue loading the business directory. Please try again later.
            </p>
          </div>
        </div>
      </section>
    );
  }

  if (isLoading) {
    return (
      <section id="directory" className="py-16 px-6 bg-gray-800">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              {isFiltered ? 'Search Results' : 'Featured Companies'}
            </h2>
            <p className="text-gray-300">Loading directory...</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-gray-800 border border-gray-700 rounded-lg p-6 animate-pulse">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-gray-700 rounded"></div>
                  <div className="w-32 h-5 bg-gray-700 rounded"></div>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="w-full h-4 bg-gray-700 rounded"></div>
                  <div className="w-3/4 h-4 bg-gray-700 rounded"></div>
                </div>
                <div className="w-24 h-8 bg-gray-700 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="directory" className="py-16 px-6 bg-gray-800">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">
            {isFiltered ? `Search Results (${companies.length})` : 'Featured Companies'}
          </h2>
          <p className="text-gray-300">
            {isFiltered 
              ? 'Businesses matching your search criteria'
              : 'Discover Alabama\'s leading AI and technology companies'
            }
          </p>
        </div>
        
        {companies.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold text-gray-300 mb-2">
              {isFiltered ? 'No businesses found' : 'No companies available'}
            </h3>
            <p className="text-gray-400">
              {isFiltered 
                ? 'Try adjusting your search criteria or browse all companies.'
                : 'Check back soon for new additions to our directory.'
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {companies.map((business) => (
              <BusinessCard
                key={business.id}
                business={business}
                onViewProfile={onViewProfile}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedCompaniesSection;
