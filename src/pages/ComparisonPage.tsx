
import { useSearchParams, Link } from 'react-router-dom';
import { useBusinesses } from '@/hooks/useBusinesses';
import ComparisonTable from '@/components/comparison/ComparisonTable';
import Header from '@/components/sections/Header';
import Footer from '@/components/sections/Footer';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import SEO from '@/components/seo/SEO';

const ComparisonPage = () => {
  const [searchParams] = useSearchParams();
  const ids = searchParams.get('ids')?.split(',').map(Number) || [];

  const { data: businesses, isLoading, error } = useBusinesses();

  const businessesToCompare = businesses?.filter(b => ids.includes(b.id)) || [];

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="text-center py-20 bg-gray-900/50 rounded-lg flex flex-col items-center justify-center">
          <Loader2 className="w-12 h-12 animate-spin mb-4" />
          <h2 className="text-2xl font-semibold">Loading Comparison...</h2>
          <p className="text-gray-400 mt-2">Fetching the latest business data.</p>
        </div>
      );
    }
  
    if (error) {
      return (
        <div className="text-center py-20 bg-red-900/20 border border-red-500/30 rounded-lg">
          <h2 className="text-2xl font-semibold text-red-400">Error Loading Data</h2>
          <p className="text-gray-400 mt-2">There was a problem fetching business details. Please try again later.</p>
        </div>
      );
    }

    if (businessesToCompare.length > 0) {
      return <ComparisonTable businesses={businessesToCompare} />;
    }

    return (
      <div className="text-center py-20 bg-gray-900/50 rounded-lg">
        <h2 className="text-2xl font-semibold">No Businesses to Compare</h2>
        <p className="text-gray-400 mt-4">It looks like you haven't selected any businesses. Please go back to the directory and add some to your comparison list.</p>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-700 to-gray-800 text-white">
      <SEO 
        title="Business Comparison"
        description="Compare businesses side-by-side to find the perfect match for your needs."
      />
      <Header />
      <main className="container mx-auto py-12 px-6">
        <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
            <h1 className="text-4xl font-bold">Business Comparison</h1>
            <Button asChild variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700">
                <Link to="/">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Directory
                </Link>
            </Button>
        </div>
        
        {renderContent()}
      </main>
      <Footer />
    </div>
  );
};

export default ComparisonPage;
