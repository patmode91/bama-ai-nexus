
import QuickStartQuiz from '@/components/ai/QuickStartQuiz';
import AIMatchmaking from '@/components/ai/AIMatchmaking';
import MobileNavigation from '@/components/mobile/MobileNavigation';
import EnhancedBamaBot from '@/components/ai/EnhancedBamaBot';
import AuthPage from '@/components/auth/AuthPage';
import Header from '@/components/sections/Header';
import HeroSection from '@/components/sections/HeroSection';
import FeaturedCompaniesSection from '@/components/sections/FeaturedCompaniesSection';
import CTASection from '@/components/sections/CTASection';
import Footer from '@/components/sections/Footer';
import AdvancedSearch from '@/components/search/AdvancedSearch';
import BusinessStats from '@/components/business/BusinessStats';
import CategoryBrowser from '@/components/business/CategoryBrowser';
import SEO from '@/components/seo/SEO';
import { useIndexPage } from '@/hooks/useIndexPage';

const Index = () => {
  const {
    showQuiz,
    setShowQuiz,
    quizCompleted,
    userAnswers,
    filteredCompanies,
    setFilteredCompanies,
    showAuth,
    setShowAuth,
    setCurrentView,
    businessesLoading,
    businessesError,
    handleQuizComplete,
    handleSearch,
    handleCategorySelect,
    displayedCompanies,
  } = useIndexPage();

  const handleViewProfile = (companyId: number) => {
    console.log('Viewing profile for company:', companyId);
    // Navigate to company profile
  };

  if (showAuth) {
    return (
      <AuthPage 
        onAuthSuccess={() => setShowAuth(false)}
        onBack={() => setShowAuth(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-700 to-gray-800">
      <SEO 
        title="Home"
        description="Discover, connect, and grow with Alabama's thriving artificial intelligence community. From Birmingham to Huntsville, find the AI solutions and talent that drive innovation."
      />
      <Header />

      <HeroSection 
        onStartQuiz={() => setShowQuiz(true)}
        onSearch={handleSearch}
        onClearSearch={() => setFilteredCompanies([])}
      />

      {/* Quick Start Quiz Modal */}
      {showQuiz && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <QuickStartQuiz 
            onComplete={handleQuizComplete}
            onSkip={() => setShowQuiz(false)}
          />
        </div>
      )}

      {/* AI Matchmaking Results */}
      {quizCompleted && (
        <section className="py-16 px-6 bg-gray-800">
          <div className="container mx-auto max-w-4xl">
            <AIMatchmaking 
              userAnswers={userAnswers}
              onViewProfile={handleViewProfile}
            />
          </div>
        </section>
      )}

      {/* Business Statistics */}
      <section className="py-8 px-6 bg-gray-900">
        <div className="container mx-auto">
          <BusinessStats />
        </div>
      </section>

      {/* Advanced Search */}
      <section className="py-8 px-6">
        <div className="container mx-auto">
          <AdvancedSearch 
            onSearch={handleSearch}
            onClearSearch={() => {
              setFilteredCompanies([]);
              setCurrentView('directory');
            }}
          />
        </div>
      </section>

      {/* Category Browser */}
      <section className="py-8 px-6 bg-gray-900">
        <div className="container mx-auto">
          <CategoryBrowser onCategorySelect={handleCategorySelect} />
        </div>
      </section>

      <FeaturedCompaniesSection
        companies={displayedCompanies}
        isLoading={businessesLoading}
        hasError={!!businessesError}
        isFiltered={filteredCompanies.length > 0}
        onViewProfile={handleViewProfile}
      />

      <CTASection />

      <Footer />

      <MobileNavigation />
      
      <EnhancedBamaBot />
    </div>
  );
};

export default Index;
