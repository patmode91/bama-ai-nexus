import { Business } from '@/hooks/useBusinesses';
import BusinessCard from '@/components/business/BusinessCard';

interface FeaturedCompaniesSectionProps {
  companies: Business[];
  isLoading: boolean;
  hasError: boolean;
  isFiltered: boolean;
  onViewProfile: (businessId: number) => void;
  comparisonList: number[];
  addOrRemoveFromComparison: (businessId: number) => void;
  isCompared: (businessId: number) => boolean;
}

const FeaturedCompaniesSection = ({
  companies,
  isLoading,
  hasError,
  isFiltered,
  onViewProfile,
  comparisonList,
  addOrRemoveFromComparison,
  isCompared
}: FeaturedCompaniesSectionProps) => {

  if (isLoading) {
    return (
      <section className="py-16 px-6">
        <div className="container mx-auto">
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

  return (
    <section className="py-16 px-6">
      <div className="container mx-auto">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-2">
            {isFiltered ? 'Search Results' : 'Featured Companies'}
          </h2>
          <p className="text-gray-400">
            {isFiltered ? 'Showing businesses that match your criteria.' : 'Discover leading AI and technology companies in Alabama.'}
          </p>
        </div>
        
        {companies.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {companies.map(business => {
              const isSelected = isCompared(business.id);
              return (
                <BusinessCard 
                  key={business.id}
                  business={business}
                  onViewProfile={onViewProfile}
                  onCompareToggle={addOrRemoveFromComparison}
                  isCompared={isSelected}
                  isCompareDisabled={!isSelected && comparisonList.length >= 4}
                />
              )
            })}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-800/50 rounded-lg">
            <h3 className="text-xl font-semibold text-white">No Companies Found</h3>
            <p className="text-gray-400 mt-2">Try adjusting your search filters or check back later.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedCompaniesSection;
