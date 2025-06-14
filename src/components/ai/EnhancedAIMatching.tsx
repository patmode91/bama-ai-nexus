
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Sparkles, 
  Brain, 
  Target, 
  TrendingUp, 
  Users, 
  MapPin, 
  Star, 
  ArrowRight,
  Zap,
  Filter,
  BarChart3
} from 'lucide-react';
import { useBusinesses } from '@/hooks/useBusinesses';
import { useProfile } from '@/hooks/useProfile';
import { matchmakingService } from '@/services/matchmakingService';
import { useNavigate } from 'react-router-dom';

interface MatchResult {
  business: any;
  matchScore: number;
  matchReasons: string[];
  confidenceLevel: 'high' | 'medium' | 'low';
  recommendations: string[];
}

interface EnhancedAIMatchingProps {
  searchQuery?: string;
  matchingType?: 'b2b' | 'candidate-to-job' | 'startup-to-investor';
  requirements?: any;
}

const EnhancedAIMatching = ({ 
  searchQuery = '', 
  matchingType = 'b2b',
  requirements = {}
}: EnhancedAIMatchingProps) => {
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [filterLevel, setFilterLevel] = useState<'all' | 'high' | 'medium'>('all');
  const [progress, setProgress] = useState(0);
  
  const { data: businesses, isLoading } = useBusinesses();
  const { profile } = useProfile();
  const navigate = useNavigate();

  const performEnhancedMatching = async () => {
    if (!businesses || businesses.length === 0) return;

    setIsAnalyzing(true);
    setAnalysisComplete(false);
    setProgress(0);

    try {
      // Simulate AI processing stages
      const stages = [
        'Analyzing user preferences...',
        'Processing business data...',
        'Calculating compatibility scores...',
        'Generating match explanations...',
        'Finalizing recommendations...'
      ];

      for (let i = 0; i < stages.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 800));
        setProgress((i + 1) * 20);
      }

      // Use the matchmaking service for advanced matching
      const matchRequest = {
        type: matchingType,
        description: searchQuery || `Looking for ${matchingType} opportunities in Alabama AI ecosystem`,
        requirements: {
          location: profile?.company || requirements.location,
          industry: profile?.industry || requirements.industry,
          ...requirements
        },
        userProfile: profile
      };

      const matchResults = await matchmakingService.findMatches(matchRequest);
      setMatches(matchResults);
      setAnalysisComplete(true);
    } catch (error) {
      console.error('Enhanced matching error:', error);
    } finally {
      setIsAnalyzing(false);
      setProgress(100);
    }
  };

  useEffect(() => {
    if (businesses && businesses.length > 0) {
      performEnhancedMatching();
    }
  }, [businesses, searchQuery, matchingType]);

  const getFilteredMatches = () => {
    switch (filterLevel) {
      case 'high':
        return matches.filter(match => match.confidenceLevel === 'high');
      case 'medium':
        return matches.filter(match => match.confidenceLevel === 'medium');
      default:
        return matches;
    }
  };

  const getConfidenceColor = (level: string) => {
    switch (level) {
      case 'high': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getMatchTypeIcon = () => {
    switch (matchingType) {
      case 'candidate-to-job': return <Users className="w-5 h-5" />;
      case 'startup-to-investor': return <TrendingUp className="w-5 h-5" />;
      default: return <Brain className="w-5 h-5" />;
    }
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

  return (
    <div className="space-y-6">
      {/* Enhanced Matching Header */}
      <Card className="bg-gradient-to-r from-gray-800 to-gray-700 border-gray-600">
        <CardHeader>
          <CardTitle className="flex items-center text-white">
            {getMatchTypeIcon()}
            <span className="ml-2">Enhanced AI Matching</span>
            <Badge className="ml-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white">
              AI 2.0
            </Badge>
          </CardTitle>
          <p className="text-gray-300">
            Advanced machine learning algorithms analyzing {businesses?.length || 0} businesses
          </p>
        </CardHeader>
        <CardContent>
          {isAnalyzing ? (
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Brain className="w-5 h-5 text-[#00C2FF] animate-pulse" />
                <span className="text-white">Processing with enhanced AI...</span>
              </div>
              <Progress value={progress} className="h-3" />
              <div className="text-sm text-gray-300">
                Using neural networks to find perfect matches...
              </div>
            </div>
          ) : analysisComplete ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-[#00C2FF]">{matches.length}</div>
                <div className="text-sm text-gray-300">Total Matches</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">
                  {matches.filter(m => m.confidenceLevel === 'high').length}
                </div>
                <div className="text-sm text-gray-300">High Confidence</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400">
                  {matches.filter(m => m.matchScore >= 80).length}
                </div>
                <div className="text-sm text-gray-300">Top Scores</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">
                  {Math.round((matches.reduce((acc, m) => acc + m.matchScore, 0) / matches.length) || 0)}%
                </div>
                <div className="text-sm text-gray-300">Avg Match</div>
              </div>
            </div>
          ) : (
            <Button 
              onClick={performEnhancedMatching}
              className="bg-[#00C2FF] hover:bg-[#00A8D8]"
            >
              <Zap className="w-4 h-4 mr-2" />
              Start Enhanced Analysis
            </Button>
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
                <span className="text-sm text-gray-300">Filter by confidence:</span>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant={filterLevel === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterLevel('all')}
                  className={filterLevel === 'all' ? 'bg-[#00C2FF]' : 'border-gray-600 text-gray-300'}
                >
                  All ({matches.length})
                </Button>
                <Button
                  variant={filterLevel === 'high' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterLevel('high')}
                  className={filterLevel === 'high' ? 'bg-[#00C2FF]' : 'border-gray-600 text-gray-300'}
                >
                  High ({matches.filter(m => m.confidenceLevel === 'high').length})
                </Button>
                <Button
                  variant={filterLevel === 'medium' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterLevel('medium')}
                  className={filterLevel === 'medium' ? 'bg-[#00C2FF]' : 'border-gray-600 text-gray-300'}
                >
                  Medium ({matches.filter(m => m.confidenceLevel === 'medium').length})
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Enhanced Match Results */}
      {analysisComplete && (
        <div className="space-y-4">
          {getFilteredMatches().map((match, index) => (
            <Card 
              key={match.business.id} 
              className="bg-gray-800 border-gray-700 hover:border-[#00C2FF] transition-all duration-300 hover:shadow-lg"
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-white">
                        {match.business.businessname}
                      </h3>
                      {index === 0 && (
                        <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black">
                          <Star className="w-3 h-3 mr-1" />
                          Best Match
                        </Badge>
                      )}
                      {match.business.verified && (
                        <Badge className="bg-green-500 text-white">Verified</Badge>
                      )}
                      <Badge className={`${getConfidenceColor(match.confidenceLevel)} text-white`}>
                        {match.confidenceLevel.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-gray-300 text-sm mb-3 leading-relaxed">
                      {match.business.description}
                    </p>
                    <div className="flex items-center text-sm text-gray-400 space-x-4">
                      <div className="flex items-center">
                        <MapPin className="w-3 h-3 mr-1" />
                        {match.business.location}
                      </div>
                      {match.business.employees_count && (
                        <div className="flex items-center">
                          <Users className="w-3 h-3 mr-1" />
                          {match.business.employees_count} employees
                        </div>
                      )}
                      {match.business.rating && (
                        <div className="flex items-center">
                          <Star className="w-3 h-3 mr-1 text-yellow-400" />
                          {match.business.rating}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right space-y-2">
                    <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold px-3 py-1">
                      {match.matchScore}% Match
                    </Badge>
                    <div className="text-xs text-gray-400">
                      AI Confidence: {match.confidenceLevel}
                    </div>
                  </div>
                </div>

                {/* Enhanced Match Analysis */}
                <div className="mb-4 space-y-3">
                  <div className="text-sm text-gray-300 mb-2 font-semibold">AI Analysis:</div>
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

                {/* Recommendations */}
                {match.recommendations.length > 0 && (
                  <div className="mb-4 space-y-2">
                    <div className="text-sm text-gray-300 font-semibold">Recommended Actions:</div>
                    <ul className="text-xs text-gray-400 space-y-1">
                      {match.recommendations.map((rec, recIndex) => (
                        <li key={recIndex} className="flex items-start">
                          <Target className="w-3 h-3 mr-2 mt-0.5 text-[#00C2FF]" />
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Match Score Breakdown */}
                <div className="mb-4 space-y-2">
                  <div className="text-sm text-gray-300 font-semibold">Score Breakdown:</div>
                  <div className="grid grid-cols-3 gap-4 text-xs">
                    <div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Relevance</span>
                        <span className="text-white">{Math.round(match.matchScore * 0.4)}%</span>
                      </div>
                      <Progress value={match.matchScore * 0.4} className="h-1 mt-1" />
                    </div>
                    <div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Compatibility</span>
                        <span className="text-white">{Math.round(match.matchScore * 0.35)}%</span>
                      </div>
                      <Progress value={match.matchScore * 0.35} className="h-1 mt-1" />
                    </div>
                    <div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Potential</span>
                        <span className="text-white">{Math.round(match.matchScore * 0.25)}%</span>
                      </div>
                      <Progress value={match.matchScore * 0.25} className="h-1 mt-1" />
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2 text-xs text-gray-400">
                    <BarChart3 className="w-3 h-3" />
                    <span>Enhanced AI Analysis Complete</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(`/business/${match.business.id}`)}
                    className="text-[#00C2FF] hover:text-[#00A8D8] hover:bg-gray-700"
                  >
                    View Full Profile
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
                  Try adjusting your filters or criteria to find more matches.
                </p>
                <Button
                  onClick={() => setFilterLevel('all')}
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

export default EnhancedAIMatching;
