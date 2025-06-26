
import QuickStartQuiz from '@/components/ai/QuickStartQuiz';
import AIMatchmaking from '@/components/ai/AIMatchmaking';
import MobileNavigation from '@/components/mobile/MobileNavigation';
import PWAInstallBanner from '@/components/mobile/PWAInstallBanner';
import OfflineBanner from '@/components/mobile/OfflineBanner';
import LocationBasedSearch from '@/components/mobile/LocationBasedSearch';
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
import ComparisonBar from '@/components/comparison/ComparisonBar';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, Search, Zap, Brain } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();
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
    comparisonList,
    comparisonBusinesses,
    addOrRemoveFromComparison,
    isCompared,
    clearComparison,
  } = useIndexPage();

  const handleViewProfile = (companyId: number) => {
    console.log('Viewing profile for company:', companyId);
    // Navigate to company profile
  };

  const handleCompare = () => {
    if (comparisonList.length > 0) {
      navigate(`/compare?ids=${comparisonList.join(',')}`);
    }
  };

  const handleLocationBasedSearch = (businesses: any[]) => {
    setFilteredCompanies(businesses);
    setCurrentView('directory');
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
      
      {/* PWA and Mobile Components */}
      <OfflineBanner />
      <PWAInstallBanner />
      
      <Header />

      <HeroSection 
        onStartQuiz={() => setShowQuiz(true)}
        onSearch={handleSearch}
        onClearSearch={() => setFilteredCompanies([])}
      />

      {/* AI Features Showcase */}
      <section className="py-16 px-6 bg-gray-900">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4 flex items-center justify-center gap-3">
              <Brain className="w-8 h-8 text-[#00C2FF]" />
              AI-Powered Discovery
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Experience the future of business discovery with our intelligent AI agents
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-gray-800 border-gray-700 hover:border-[#00C2FF]/50 transition-colors">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Search className="w-5 h-5 text-[#00C2FF]" />
                  Semantic Search
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 mb-4">
                  Ask natural language questions and get intelligent, context-aware results.
                </p>
                <Button 
                  onClick={() => navigate('/ai-search')} 
                  className="w-full bg-[#00C2FF] hover:bg-[#00A8D8]"
                >
                  Try Semantic Search
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700 hover:border-purple-500/50 transition-colors">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Zap className="w-5 h-5 text-purple-400" />
                  AI Matchmaking
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 mb-4">
                  Get personalized recommendations with confidence scores and explanations.
                </p>
                <Button 
                  onClick={() => navigate('/ai-search?tab=matchmaking')} 
                  className="w-full bg-purple-600 hover:bg-purple-500"
                >
                  Find Matches
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700 hover:border-green-500/50 transition-colors">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-green-400" />
                  BamaBot 2.0
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 mb-4">
                  Chat with our enhanced AI assistant for instant business intelligence.
                </p>
                <Button 
                  onClick={() => {
                    // BamaBot will automatically appear as it's already on the page
                    const bamaBotButton = document.querySelector('[data-bamabot-trigger]');
                    if (bamaBotButton) {
                      (bamaBotButton as HTMLElement).click();
                    }
                  }}
                  className="w-full bg-green-600 hover:bg-green-500"
                >
                  Chat with BamaBot
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Advanced Features CTA */}
          <div className="text-center">
            <Card className="bg-gradient-to-r from-[#00C2FF]/10 to-purple-600/10 border-[#00C2FF]/30 max-w-2xl mx-auto">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-white mb-2 flex items-center justify-center gap-2">
                  <Sparkles className="w-6 h-6 text-[#00C2FF]" />
                  Unlock Advanced Features
                </h3>
                <p className="text-gray-300 mb-4">
                  Explore enterprise-grade AI agent management, real-time collaboration, and advanced analytics
                </p>
                <Button 
                  onClick={() => navigate('/advanced-features')} 
                  className="bg-gradient-to-r from-[#00C2FF] to-purple-600 hover:from-[#00A8D8] hover:to-purple-500"
                >
                  Explore Advanced Features
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

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

      {/* Location-Based Search - Mobile First */}
      <section className="py-8 px-6 bg-gray-800">
        <div className="container mx-auto max-w-2xl">
          <LocationBasedSearch onBusinessesFound={handleLocationBasedSearch} />
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
        comparisonList={comparisonList}
        addOrRemoveFromComparison={addOrRemoveFromComparison}
        isCompared={isCompared}
      />

      <CTASection />

      <Footer />

      <MobileNavigation />
      
      <EnhancedBamaBot />

      {comparisonList.length > 0 && (
        <ComparisonBar
          businesses={comparisonBusinesses}
          onClear={clearComparison}
          onCompare={handleCompare}
          onRemove={addOrRemoveFromComparison}
        />
      )}
    </div>
  );
};

export default Index;
