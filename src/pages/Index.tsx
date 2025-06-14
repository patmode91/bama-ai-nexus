
import { useState } from 'react';
import { Search, MapPin, Building2, Users, TrendingUp, Zap, ArrowRight, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import SearchFilters from '@/components/search/SearchFilters';
import QuickStartQuiz from '@/components/ai/QuickStartQuiz';
import AIMatchmaking from '@/components/ai/AIMatchmaking';
import MobileNavigation from '@/components/mobile/MobileNavigation';
import BamaBot from '@/components/ai/BamaBot';
import DataDashboard from '@/components/dashboard/DataDashboard';
import AuthPage from '@/components/auth/AuthPage';
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
          business.category?.toLowerCase().includes(query.toLowerCase())
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

  // Use real businesses data or fall back to mock data for featured companies
  const featuredCompanies = businesses?.slice(0, 6) || [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-700 to-gray-800">
      {/* Header */}
      <header className="border-b border-gray-600 bg-gray-700/80 backdrop-blur-md sticky top-0 z-40">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-[#00C2FF] rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">BamaAI Connect</h1>
                <p className="text-xs text-gray-300">Alabama's AI Ecosystem Hub</p>
              </div>
            </div>
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#directory" className="text-gray-300 hover:text-[#00C2FF] transition-colors">Directory</a>
              <a href="#insights" className="text-gray-300 hover:text-[#00C2FF] transition-colors">Insights</a>
              <a href="#jobs" className="text-gray-300 hover:text-[#00C2FF] transition-colors">Jobs</a>
              <Button 
                variant="outline" 
                size="sm" 
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
                onClick={() => setShowAuth(true)}
              >
                Sign In
              </Button>
              <Button size="sm" className="bg-[#00C2FF] hover:bg-[#00A8D8]">Join Directory</Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto text-center max-w-4xl">
          <div className="inline-flex items-center px-4 py-2 bg-[#00C2FF]/20 rounded-full text-[#00C2FF] text-sm font-medium mb-6">
            <Zap className="w-4 h-4 mr-2" />
            Powered by AI Intelligence
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Alabama's
            <span className="bg-gradient-to-r from-[#00C2FF] to-blue-600 bg-clip-text text-transparent"> AI Ecosystem</span>
            <br />Connected
          </h1>
          <p className="text-xl text-gray-300 mb-8 leading-relaxed">
            Discover, connect, and grow with Alabama's thriving artificial intelligence community. 
            From Birmingham to Huntsville, find the AI solutions and talent that drive innovation.
          </p>
          
          {/* Quick Start CTA */}
          <div className="mb-8">
            <Button 
              onClick={() => setShowQuiz(true)}
              size="lg" 
              className="bg-gradient-to-r from-[#00C2FF] to-blue-600 hover:from-[#00A8D8] hover:to-blue-500 text-white font-semibold px-8 py-4 rounded-full shadow-lg"
            >
              <Zap className="w-5 h-5 mr-2" />
              Get AI-Powered Recommendations
            </Button>
            <p className="text-sm text-gray-400 mt-2">Takes 30 seconds • Get personalized matches</p>
          </div>

          {/* Enhanced Search Bar */}
          <SearchFilters onSearch={handleSearch} onClear={() => setFilteredCompanies([])} />

          {/* Real-time Data Dashboard */}
          <div className="mt-12">
            <DataDashboard />
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

      {/* Featured Companies */}
      <section id="directory" className="py-16 px-6 bg-gray-800">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              {filteredCompanies.length > 0 ? 'Search Results' : 'Featured AI Companies'}
            </h2>
            <p className="text-lg text-gray-300">
              {filteredCompanies.length > 0 
                ? `Found ${filteredCompanies.length} companies matching your criteria`
                : 'Leading the future of artificial intelligence in Alabama'
              }
            </p>
          </div>
          
          {businessesLoading && (
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
          )}

          {businessesError && (
            <div className="text-center text-gray-400 py-8">
              <p>Unable to load companies. Please try again later.</p>
            </div>
          )}

          {!businessesLoading && !businessesError && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(filteredCompanies.length > 0 ? filteredCompanies : featuredCompanies).map((company) => (
                <Card key={company.id} className="hover:shadow-lg transition-shadow cursor-pointer group bg-gray-800 border-gray-700">
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
                    <p className="text-gray-300 text-sm mb-4 leading-relaxed">
                      {company.description || 'AI solutions provider in Alabama'}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex space-x-2">
                        <Badge variant="secondary" className="text-xs bg-gray-700 text-gray-300">
                          {company.category || 'AI Services'}
                        </Badge>
                        {company.employees_count && (
                          <Badge variant="outline" className="text-xs border-gray-600 text-gray-400">
                            {company.employees_count} employees
                          </Badge>
                        )}
                      </div>
                      <Button variant="ghost" size="sm" className="text-[#00C2FF] hover:text-[#00A8D8] hover:bg-gray-700" onClick={() => handleViewProfile(company.id)}>
                        View Profile
                        <ArrowRight className="w-3 h-3 ml-1" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          
          <div className="text-center mt-8">
            <Button variant="outline" size="lg" className="border-[#00C2FF] text-[#00C2FF] hover:bg-[#00C2FF] hover:text-white">
              Browse All Companies
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-6 bg-gradient-to-r from-gray-800 to-gray-700">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Join Alabama's AI Revolution?</h2>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            Whether you're building AI solutions or looking to implement them, 
            BamaAI Connect helps you find the right connections.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-[#00C2FF] hover:bg-[#00A8D8]">
              List Your Company
              <Building2 className="w-4 h-4 ml-2" />
            </Button>
            <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-slate-900">
              Find AI Solutions
              <Search className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t py-12 px-6">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-[#00C2FF] rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-bold text-slate-900">BamaAI Connect</span>
              </div>
              <p className="text-slate-600 mb-4 max-w-md">
                Connecting Alabama's artificial intelligence ecosystem. 
                Powered by intelligent matchmaking and real-time market insights.
              </p>
              <div className="flex items-center text-sm text-slate-500">
                <Zap className="w-4 h-4 mr-2 text-[#00C2FF]" />
                AI-Powered Platform
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 mb-4">Platform</h3>
              <ul className="space-y-2 text-slate-600">
                <li><a href="#" className="hover:text-[#00C2FF] transition-colors">Directory</a></li>
                <li><a href="#" className="hover:text-[#00C2FF] transition-colors">Job Board</a></li>
                <li><a href="#" className="hover:text-[#00C2FF] transition-colors">Market Insights</a></li>
                <li><a href="#" className="hover:text-[#00C2FF] transition-colors">AI Matchmaking</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 mb-4">Company</h3>
              <ul className="space-y-2 text-slate-600">
                <li><a href="#" className="hover:text-[#00C2FF] transition-colors">About</a></li>
                <li><a href="#" className="hover:text-[#00C2FF] transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-[#00C2FF] transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-[#00C2FF] transition-colors">Terms</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 text-center text-slate-500">
            <p>&copy; 2024 BamaAI Connect. Empowering Alabama's AI ecosystem.</p>
          </div>
        </div>
      </footer>

      {/* Mobile Navigation */}
      <MobileNavigation />
      
      {/* BamaBot AI Assistant */}
      <BamaBot />
    </div>
  );
};

export default Index;
