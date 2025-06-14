
import { useState } from 'react';
import QuickStartQuiz from '@/components/ai/QuickStartQuiz';
import AIMatchmaking from '@/components/ai/AIMatchmaking';
import MobileNavigation from '@/components/mobile/MobileNavigation';
import BamaBot from '@/components/ai/BamaBot';
import AuthPage from '@/components/auth/AuthPage';
import Header from '@/components/sections/Header';
import HeroSection from '@/components/sections/HeroSection';
import FeaturedCompaniesSection from '@/components/sections/FeaturedCompaniesSection';
import CTASection from '@/components/sections/CTASection';
import Footer from '@/components/sections/Footer';
import { useBusinesses } from '@/hooks/useBusinesses';

const Index = () => {
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [filteredCompanies, setFilteredCompanies] = useState<any[]>([]);
  const [showAuth, setShowAuth] = useState(false);

  // Fetch real businesses data
  const { data: businesses, isLoading: businessesLoading, error: businessesError } = useBusinesses();

  const handleQuizComplete = (answers: Record<string, string>) => {
    setUserAnswers(answers);
    setQuizCompleted(true);
    setShowQuiz(false);
  };

  const handleSearch = (query: string, filters: any) => {
    console.log('Searching with:', query, filters);
    if (businesses) {
      // Filter businesses based on search query and filters
      let filtered = businesses;
      
      if (query) {
        filtered = filtered.filter(business => 
          business.businessname?.toLowerCase().includes(query.toLowerCase()) ||
          business.description?.toLowerCase().includes(query.toLowerCase()) ||
          business.category?.toLowerCase().includes(query.toLowerCase()) ||
          business.tags?.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
        );
      }
      
      if (filters.category && filters.category !== 'all') {
        filtered = filtered.filter(business => 
          business.category?.toLowerCase() === filters.category.toLowerCase()
        );
      }
      
      if (filters.location && filters.location !== 'all') {
        filtered = filtered.filter(business => 
          business.location?.toLowerCase().includes(filters.location.toLowerCase())
        );
      }
      
      setFilteredCompanies(filtered);
    }
  };

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

  // Use real businesses data or fall back to empty array
  const featuredCompanies = businesses?.slice(0, 6) || [];
  const displayedCompanies = filteredCompanies.length > 0 ? filteredCompanies : featuredCompanies;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-700 to-gray-800">
      <Header onSignIn={() => setShowAuth(true)} />

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
      
      <BamaBot />
    </div>
  );
};

export default Index;
