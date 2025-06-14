import { useState } from 'react';
import { Search, MapPin, Building2, Users, TrendingUp, Zap, ArrowRight, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Index = () => {
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data for demonstration
  const featuredCompanies = [
    {
      id: 1,
      name: "Birmingham AI Solutions",
      description: "Machine learning consulting and custom AI development for healthcare and manufacturing.",
      location: "Birmingham, AL",
      category: "ML Consulting",
      employees: "25-50",
      rating: 4.8,
      logo: "🤖"
    },
    {
      id: 2,
      name: "Huntsville Robotics Lab",
      description: "Advanced robotics and computer vision systems for aerospace and defense applications.",
      location: "Huntsville, AL",
      category: "Robotics",
      employees: "51-100",
      rating: 4.9,
      logo: "🔬"
    },
    {
      id: 3,
      name: "Mobile Data Analytics",
      description: "Big data processing and predictive analytics for retail and logistics companies.",
      location: "Mobile, AL",
      category: "Data Analytics",
      employees: "10-25",
      rating: 4.7,
      logo: "📊"
    }
  ];

  const stats = [
    { label: "AI Companies", value: "150+", icon: Building2 },
    { label: "Job Openings", value: "300+", icon: Users },
    { label: "Total Funding", value: "$45M+", icon: TrendingUp },
    { label: "Success Stories", value: "50+", icon: Star }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-800 to-gray-900">
      {/* Header */}
      <header className="border-b border-gray-700 bg-gray-800/80 backdrop-blur-md sticky top-0 z-50">
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
              <Button variant="outline" size="sm" className="border-gray-600 text-gray-300 hover:bg-gray-700">Sign In</Button>
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
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-12">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search for AI companies, jobs, or expertise..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 py-4 text-lg border-2 border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:border-[#00C2FF] rounded-full"
              />
              <Button 
                size="lg" 
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-[#00C2FF] hover:bg-[#00A8D8] rounded-full px-8"
              >
                Search
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
            {stats.map((stat, index) => (
              <div key={index} className="bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-700">
                <stat.icon className="w-8 h-8 text-[#00C2FF] mb-3 mx-auto" />
                <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-sm text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Companies */}
      <section id="directory" className="py-16 px-6 bg-gray-900">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Featured AI Companies</h2>
            <p className="text-lg text-gray-300">Leading the future of artificial intelligence in Alabama</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredCompanies.map((company) => (
              <Card key={company.id} className="hover:shadow-lg transition-shadow cursor-pointer group bg-gray-800 border-gray-700">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">{company.logo}</div>
                      <div>
                        <CardTitle className="text-lg group-hover:text-[#00C2FF] transition-colors text-white">
                          {company.name}
                        </CardTitle>
                        <div className="flex items-center text-sm text-gray-400 mt-1">
                          <MapPin className="w-3 h-3 mr-1" />
                          {company.location}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center text-sm text-gray-300">
                      <Star className="w-4 h-4 text-yellow-400 mr-1" />
                      {company.rating}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300 text-sm mb-4 leading-relaxed">
                    {company.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex space-x-2">
                      <Badge variant="secondary" className="text-xs bg-gray-700 text-gray-300">
                        {company.category}
                      </Badge>
                      <Badge variant="outline" className="text-xs border-gray-600 text-gray-400">
                        {company.employees}
                      </Badge>
                    </div>
                    <Button variant="ghost" size="sm" className="text-[#00C2FF] hover:text-[#00A8D8] hover:bg-gray-700">
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

      {/* CTA Section */}
      <section className="py-16 px-6 bg-gradient-to-r from-slate-900 to-slate-800">
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
    </div>
  );
};

export default Index;
