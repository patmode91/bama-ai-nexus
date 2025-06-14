
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Sparkles, 
  TrendingUp, 
  Users, 
  MapPin, 
  Star, 
  ArrowRight, 
  Filter,
  Brain,
  Target
} from 'lucide-react';
import { aiService, BusinessMatch } from '@/services/aiService';
import { useBusinesses } from '@/hooks/useBusinesses';

interface UserProfile {
  industry?: string;
  location?: string;
  companySize?: string;
  budget?: string;
  timeline?: string;
  technologies?: string[];
  projectType?: string;
}

interface AIMatchingEngineProps {
  userProfile?: UserProfile;
  onViewProfile?: (businessId: number) => void;
  onUpdateProfile?: (profile: UserProfile) => void;
}

const AIMatchingEngine = ({ userProfile, onViewProfile, onUpdateProfile }: AIMatchingEngineProps) => {
  const [matches, setMatches] = useState<BusinessMatch[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'high' | 'medium'>('all');
  const { data: businesses, isLoading } = useBusinesses();

  useEffect(() => {
    if (businesses && userProfile && Object.keys(userProfile).length > 0) {
      performMatching();
    }
  }, [businesses, userProfile]);

  const performMatching = async () => {
    if (!businesses || !userProfile) return;

    setIsAnalyzing(true);
    setAnalysisComplete(false);

    // Simulate AI processing time
    await new Promise(resolve => setTimeout(resolve, 2000));

    try {
      const businessMatches = aiService.generateBusinessMatches(userProfile, businesses);
      setMatches(businessMatches);
      setAnalysisComplete(true);
    } catch (error) {
      console.error('Error generating matches:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getFilteredMatches = () => {
    switch (filterType) {
      case 'high':
        return matches.filter(match => match.matchScore >= 80);
      case 'medium':
        return matches.filter(match => match.matchScore >= 60 && match.matchScore < 80);
      default:
        return matches;
    }
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 90) return 'bg-green-500';
    if (score >= 80) return 'bg-blue-500';
    if (score >= 70) return 'bg-yellow-500';
    return 'bg-gray-500';
  };

  const getConfidenceLevel = (confidence: number) => {
    if (confidence >= 0.8) return 'Very High';
    if (confidence >= 0.6) return 'High';
    if (confidence >= 0.4) return 'Medium';
    return 'Low';
  };

  if (isLoading) {
    return (
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-6 text-center">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-600 rounded w-3/4 mx-auto"></div>
            <div className="h-32 bg-gray-600 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!userProfile || Object.keys(userProfile).length === 0) {
    return (
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center text-white">
            <Brain className="w-5 h-5 mr-2 text-[#00C2FF]" />
            AI Matching Engine
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Target className="w-16 h-16 mx-auto text-gray-500 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Ready to Find Perfect Matches?</h3>
            <p className="text-gray-300 mb-4">
              Complete your profile to get AI-powered business recommendations tailored to your needs.
            </p>
            <Button 
              onClick={() => onUpdateProfile?.({})}
              className="bg-[#00C2FF] hover:bg-[#00A8D8]"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Start Matching
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Matching Status */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center text-white">
            <Brain className="w-5 h-5 mr-2 text-[#00C2FF]" />
            AI Matching Engine
            <Badge className="ml-2 bg-purple-500 text-white">Advanced AI</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isAnalyzing ? (
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Sparkles className="w-5 h-5 text-[#00C2FF] animate-pulse" />
                <span className="text-white">Analyzing {businesses?.length || 0} businesses...</span>
              </div>
              <Progress value={66} className="h-2" />
              <div className="text-sm text-gray-300">
                Processing your preferences and matching against our database...
              </div>
            </div>
          ) : analysisComplete ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-white">Analysis Complete</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={performMatching}
                  className="border-[#00C2FF] text-[#00C2FF] hover:bg-[#00C2FF] hover:text-white"
                >
                  <Brain className="w-4 h-4 mr-2" />
                  Re-analyze
                </Button>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-[#00C2FF]">{matches.length}</div>
                  <div className="text-sm text-gray-300">Total Matches</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-400">
                    {matches.filter(m => m.matchScore >= 80).length}
                  </div>
                  <div className="text-sm text-gray-300">High Quality</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-yellow-400">
                    {matches.reduce((acc, m) => acc + m.confidence, 0) / matches.length || 0}
                  </div>
                  <div className="text-sm text-gray-300">Avg Confidence</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <Button 
                onClick={performMatching}
                className="bg-[#00C2FF] hover:bg-[#00A8D8]"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Start AI Analysis
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Filter Controls */}
      {analysisComplete && matches.length > 0 && (
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-300">Filter matches:</span>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant={filterType === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterType('all')}
                  className={filterType === 'all' ? 'bg-[#00C2FF]' : 'border-gray-600 text-gray-300'}
                >
                  All ({matches.length})
                </Button>
                <Button
                  variant={filterType === 'high' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterType('high')}
                  className={filterType === 'high' ? 'bg-[#00C2FF]' : 'border-gray-600 text-gray-300'}
                >
                  High ({matches.filter(m => m.matchScore >= 80).length})
                </Button>
                <Button
                  variant={filterType === 'medium' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterType('medium')}
                  className={filterType === 'medium' ? 'bg-[#00C2FF]' : 'border-gray-600 text-gray-300'}
                >
                  Medium ({matches.filter(m => m.matchScore >= 60 && m.matchScore < 80).length})
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Match Results */}
      {analysisComplete && (
        <div className="space-y-4">
          {getFilteredMatches().map((match, index) => (
            <Card key={match.business.id} className="bg-gray-800 border-gray-700 hover:border-[#00C2FF] transition-colors">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-white">
                        {match.business.businessname}
                      </h3>
                      {index === 0 && (
                        <Badge className="bg-yellow-500 text-black">
                          <Star className="w-3 h-3 mr-1" />
                          Best Match
                        </Badge>
                      )}
                      {match.business.verified && (
                        <Badge className="bg-green-500 text-white">Verified</Badge>
                      )}
                    </div>
                    <p className="text-gray-300 text-sm mb-3 leading-relaxed">
                      {match.business.description}
                    </p>
                    <div className="flex items-center text-sm text-gray-400 space-x-4">
                      <div className="flex items-center">
                        <MapPin className="w-3 h-3 mr-1" />
                        {match.business.location}
                      </div>
                      <div className="flex items-center">
                        <Users className="w-3 h-3 mr-1" />
                        {match.business.employees_count} employees
                      </div>
                      {match.business.rating && (
                        <div className="flex items-center">
                          <Star className="w-3 h-3 mr-1 text-yellow-400" />
                          {match.business.rating}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right space-y-2">
                    <Badge className={`${getMatchScoreColor(match.matchScore)} text-white font-bold px-3 py-1`}>
                      {match.matchScore}% Match
                    </Badge>
                    <div className="text-xs text-gray-400">
                      Confidence: {getConfidenceLevel(match.confidence)}
                    </div>
                  </div>
                </div>

                {/* Match Reasons */}
                <div className="mb-4">
                  <div className="text-sm text-gray-300 mb-2">Why this is a great match:</div>
                  <div className="flex flex-wrap gap-2">
                    {match.matchReasons.map((reason, reasonIndex) => (
                      <Badge
                        key={reasonIndex}
                        variant="outline"
                        className="text-xs border-[#00C2FF]/30 text-[#00C2FF] bg-[#00C2FF]/10"
                      >
                        {reason}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Match Score Breakdown */}
                <div className="mb-4 space-y-2">
                  <div className="text-sm text-gray-300">Match Score Breakdown:</div>
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Industry Fit</span>
                        <span className="text-white">{Math.round(match.matchScore * 0.4)}%</span>
                      </div>
                      <Progress value={match.matchScore * 0.4} className="h-1 mt-1" />
                    </div>
                    <div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Location</span>
                        <span className="text-white">{Math.round(match.matchScore * 0.3)}%</span>
                      </div>
                      <Progress value={match.matchScore * 0.3} className="h-1 mt-1" />
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2 text-xs text-gray-400">
                    <TrendingUp className="w-3 h-3" />
                    <span>AI Confidence: {Math.round(match.confidence * 100)}%</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onViewProfile?.(match.business.id)}
                    className="text-[#00C2FF] hover:text-[#00A8D8] hover:bg-gray-700"
                  >
                    View Details
                    <ArrowRight className="w-3 h-3 ml-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          {getFilteredMatches().length === 0 && (
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-8 text-center">
                <Target className="w-12 h-12 mx-auto text-gray-500 mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">No matches found</h3>
                <p className="text-gray-300 mb-4">
                  Try adjusting your filters or updating your profile preferences.
                </p>
                <Button
                  onClick={() => setFilterType('all')}
                  variant="outline"
                  className="border-gray-600 text-gray-300"
                >
                  Show All Results
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default AIMatchingEngine;
