
import { useState, useEffect } from 'react';
import { Sparkles, TrendingUp, Users, MapPin, Star, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Company {
  id: number;
  name: string;
  description: string;
  location: string;
  category: string;
  employees: string;
  rating: number;
  logo: string;
  matchScore: number;
  matchReasons: string[];
}

interface AIMatchmakingProps {
  userAnswers?: Record<string, string>;
  onViewProfile: (companyId: number) => void;
}

const AIMatchmaking = ({ userAnswers, onViewProfile }: AIMatchmakingProps) => {
  const [matchedCompanies, setMatchedCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Mock AI matching algorithm
  useEffect(() => {
    const mockMatching = () => {
      setIsLoading(true);
      
      // Simulate API call delay
      setTimeout(() => {
        const companies: Company[] = [
          {
            id: 1,
            name: "Birmingham AI Solutions",
            description: "Machine learning consulting and custom AI development for healthcare and manufacturing.",
            location: "Birmingham, AL",
            category: "ML Consulting",
            employees: "25-50",
            rating: 4.8,
            logo: "🤖",
            matchScore: 94,
            matchReasons: ["Healthcare specialization", "Local presence", "Immediate availability"]
          },
          {
            id: 2,
            name: "Huntsville Robotics Lab",
            description: "Advanced robotics and computer vision systems for aerospace and defense applications.",
            location: "Huntsville, AL",
            category: "Robotics",
            employees: "51-100",
            rating: 4.9,
            logo: "🔬",
            matchScore: 87,
            matchReasons: ["Computer vision expertise", "Aerospace focus", "Strong rating"]
          },
          {
            id: 3,
            name: "Mobile Data Analytics",
            description: "Big data processing and predictive analytics for retail and logistics companies.",
            location: "Mobile, AL",
            category: "Data Analytics",
            employees: "10-25",
            rating: 4.7,
            logo: "📊",
            matchScore: 81,
            matchReasons: ["Retail experience", "Data analytics", "Quick timeline fit"]
          }
        ];

        // Apply basic matching logic based on user answers
        if (userAnswers) {
          companies.forEach(company => {
            let score = company.matchScore;
            
            // Adjust score based on industry match
            if (userAnswers.industry === 'healthcare' && company.category.includes('ML')) {
              score += 5;
            }
            if (userAnswers.industry === 'aerospace' && company.category.includes('Robotics')) {
              score += 5;
            }
            
            // Adjust score based on urgency
            if (userAnswers.urgency === 'immediate') {
              score += 3;
            }
            
            company.matchScore = Math.min(99, score);
          });
          
          companies.sort((a, b) => b.matchScore - a.matchScore);
        }

        setMatchedCompanies(companies);
        setIsLoading(false);
      }, 1500);
    };

    mockMatching();
  }, [userAnswers]);

  if (isLoading) {
    return (
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center text-white">
            <Sparkles className="w-5 h-5 mr-2 text-[#00C2FF]" />
            AI is finding your perfect matches...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gray-700 rounded-lg"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center text-white">
          <Sparkles className="w-5 h-5 mr-2 text-[#00C2FF]" />
          Your AI-Powered Matches
        </CardTitle>
        <p className="text-gray-300">
          Based on your preferences, here are the best AI companies for you
        </p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {matchedCompanies.map((company, index) => (
          <div
            key={company.id}
            className="group relative border border-gray-700 rounded-lg p-4 hover:border-[#00C2FF] transition-all bg-gray-700/50"
          >
            {/* Match Score Badge */}
            <div className="absolute top-4 right-4">
              <Badge className="bg-[#00C2FF] text-white font-bold">
                {company.matchScore}% Match
              </Badge>
            </div>

            <div className="flex items-start space-x-4 pr-20">
              <div className="text-3xl">{company.logo}</div>
              
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h3 className="font-semibold text-white group-hover:text-[#00C2FF] transition-colors">
                    {company.name}
                  </h3>
                  {index === 0 && (
                    <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                      <Star className="w-3 h-3 mr-1" />
                      Top Match
                    </Badge>
                  )}
                </div>
                
                <p className="text-gray-300 text-sm mb-3 leading-relaxed">
                  {company.description}
                </p>
                
                <div className="flex items-center text-sm text-gray-400 mb-3">
                  <MapPin className="w-3 h-3 mr-1" />
                  {company.location}
                  <span className="mx-2">•</span>
                  <Users className="w-3 h-3 mr-1" />
                  {company.employees}
                  <span className="mx-2">•</span>
                  <Star className="w-3 h-3 mr-1 text-yellow-400" />
                  {company.rating}
                </div>
                
                {/* Match Reasons */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {company.matchReasons.map((reason, reasonIndex) => (
                    <Badge
                      key={reasonIndex}
                      variant="outline"
                      className="text-xs border-[#00C2FF]/30 text-[#00C2FF] bg-[#00C2FF]/10"
                    >
                      {reason}
                    </Badge>
                  ))}
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onViewProfile(company.id)}
                  className="text-[#00C2FF] hover:text-[#00A8D8] hover:bg-gray-600 p-0"
                >
                  View Full Profile
                  <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              </div>
            </div>
          </div>
        ))}
        
        <div className="text-center pt-4">
          <Button variant="outline" className="border-[#00C2FF] text-[#00C2FF] hover:bg-[#00C2FF] hover:text-white">
            <TrendingUp className="w-4 h-4 mr-2" />
            See More Matches
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AIMatchmaking;
