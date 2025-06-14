
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Sparkles, 
  Brain, 
  Heart, 
  TrendingUp, 
  Users, 
  MapPin, 
  Star, 
  ArrowRight,
  RefreshCw,
  Settings
} from 'lucide-react';
import { useBusinesses } from '@/hooks/useBusinesses';
import { useProfile } from '@/hooks/useProfile';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { useNavigate } from 'react-router-dom';

interface PersonalizedRecommendation {
  business: any;
  relevanceScore: number;
  personalizedReasons: string[];
  recommendationType: 'perfect_match' | 'growth_opportunity' | 'trending' | 'similar_interests';
  confidenceLevel: number;
}

const PersonalizedRecommendationEngine = () => {
  const [recommendations, setRecommendations] = useState<PersonalizedRecommendation[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  
  const { data: businesses } = useBusinesses();
  const { profile } = useProfile();
  const { preferences, getMatchingCriteria } = useUserPreferences();
  const navigate = useNavigate();

  const generatePersonalizedRecommendations = async () => {
    if (!businesses || !profile || preferences.industries.length === 0) return;

    setIsGenerating(true);
    
    try {
      // Simulate AI processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      const criteria = getMatchingCriteria();
      
      // Advanced scoring algorithm
      const scoredBusinesses = businesses.map(business => {
        let score = 0;
        const reasons: string[] = [];
        let type: PersonalizedRecommendation['recommendationType'] = 'similar_interests';

        // Industry alignment (30%)
        const industryMatch = criteria.industries.some(industry => 
          business.category?.toLowerCase().includes(industry.toLowerCase()) ||
          business.description?.toLowerCase().includes(industry.toLowerCase())
        );
        if (industryMatch) {
          score += 30;
          reasons.push(`Matches your ${criteria.industries.join(', ')} interests`);
          type = 'perfect_match';
        }

        // Location preference (20%)
        if (criteria.location && business.location?.toLowerCase().includes(criteria.location.toLowerCase())) {
          score += 20;
          reasons.push(`Located in your preferred area: ${criteria.location}`);
        }

        // AI technology focus (25%)
        const aiMatch = criteria.aiAreas.some(area =>
          business.description?.toLowerCase().includes(area.toLowerCase()) ||
          business.tags?.some(tag => tag.toLowerCase().includes(area.toLowerCase()))
        );
        if (aiMatch) {
          score += 25;
          reasons.push('Specializes in your AI focus areas');
        }

        // Company size and collaboration type (15%)
        if (business.employees_count) {
          const sizeScore = Math.min(business.employees_count / 100, 1) * 15;
          score += sizeScore;
          if (sizeScore > 10) {
            reasons.push('Right-sized company for collaboration');
          }
        }

        // Trending and growth indicators (10%)
        if (business.rating && business.rating > 4.0) {
          score += 10;
          reasons.push('Highly rated by clients');
          type = 'trending';
        }

        // Recent activity bonus
        if (business.updated_at) {
          const daysSinceUpdate = (new Date().getTime() - new Date(business.updated_at).getTime()) / (1000 * 3600 * 24);
          if (daysSinceUpdate < 30) {
            score += 5;
            reasons.push('Recently active profile');
          }
        }

        return {
          business,
          relevanceScore: Math.min(score, 100),
          personalizedReasons: reasons,
          recommendationType: score > 70 ? 'perfect_match' : score > 50 ? 'growth_opportunity' : type,
          confidenceLevel: Math.min(score / 100, 1)
        };
      })
      .filter(rec => rec.relevanceScore > 20)
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 8);

      setRecommendations(scoredBusinesses);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error generating recommendations:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    if (businesses && profile && preferences.industries.length > 0) {
      generatePersonalizedRecommendations();
    }
  }, [businesses, profile, preferences]);

  const getRecommendationTypeColor = (type: PersonalizedRecommendation['recommendationType']) => {
    switch (type) {
      case 'perfect_match': return 'bg-green-500';
      case 'growth_opportunity': return 'bg-blue-500';
      case 'trending': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const getRecommendationTypeLabel = (type: PersonalizedRecommendation['recommendationType']) => {
    switch (type) {
      case 'perfect_match': return 'Perfect Match';
      case 'growth_opportunity': return 'Growth Opportunity';
      case 'trending': return 'Trending';
      default: return 'Similar Interests';
    }
  };

  if (!profile || preferences.industries.length === 0) {
    return (
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Brain className="w-5 h-5 text-[#00C2FF]" />
            Personalized AI Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Settings className="w-16 h-16 mx-auto text-gray-500 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Setup Required</h3>
            <p className="text-gray-300 mb-4">
              Complete your profile preferences to get personalized AI recommendations.
            </p>
            <Button 
              onClick={() => navigate('/profile')}
              className="bg-[#00C2FF] hover:bg-[#00A8D8]"
            >
              <Settings className="w-4 h-4 mr-2" />
              Configure Preferences
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-gray-800 to-gray-700 border-gray-600">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-white">
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-[#00C2FF]" />
              Personalized AI Recommendations
              <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                AI-Powered
              </Badge>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={generatePersonalizedRecommendations}
              disabled={isGenerating}
              className="border-[#00C2FF] text-[#00C2FF] hover:bg-[#00C2FF] hover:text-white"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isGenerating ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </CardTitle>
          <p className="text-gray-300">
            Tailored recommendations based on your interests in {preferences.industries.slice(0, 2).join(', ')}
            {preferences.industries.length > 2 && ` and ${preferences.industries.length - 2} more areas`}
          </p>
        </CardHeader>
        
        {isGenerating && (
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Sparkles className="w-5 h-5 text-[#00C2FF] animate-pulse" />
                <span className="text-white">Analyzing your preferences and generating recommendations...</span>
              </div>
              <Progress value={66} className="h-2" />
            </div>
          </CardContent>
        )}
      </Card>

      {/* Recommendations Grid */}
      {!isGenerating && recommendations.length > 0 && (
        <>
          <div className="grid gap-4">
            {recommendations.map((rec, index) => (
              <Card 
                key={rec.business.id} 
                className="bg-gray-800 border-gray-700 hover:border-[#00C2FF] transition-all duration-300"
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-white">
                          {rec.business.businessname}
                        </h3>
                        {index === 0 && (
                          <Badge className="bg-yellow-500 text-black">
                            <Star className="w-3 h-3 mr-1" />
                            Top Pick
                          </Badge>
                        )}
                        <Badge className={`${getRecommendationTypeColor(rec.recommendationType)} text-white`}>
                          {getRecommendationTypeLabel(rec.recommendationType)}
                        </Badge>
                        {rec.business.verified && (
                          <Badge className="bg-green-500 text-white">Verified</Badge>
                        )}
                      </div>
                      <p className="text-gray-300 text-sm mb-3 line-clamp-2">
                        {rec.business.description}
                      </p>
                      <div className="flex items-center text-sm text-gray-400 space-x-4">
                        <div className="flex items-center">
                          <MapPin className="w-3 h-3 mr-1" />
                          {rec.business.location}
                        </div>
                        {rec.business.category && (
                          <div className="flex items-center">
                            <Users className="w-3 h-3 mr-1" />
                            {rec.business.category}
                          </div>
                        )}
                        {rec.business.rating && (
                          <div className="flex items-center">
                            <Star className="w-3 h-3 mr-1 text-yellow-400" />
                            {rec.business.rating}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right space-y-2">
                      <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold px-3 py-1">
                        {Math.round(rec.relevanceScore)}% Fit
                      </Badge>
                      <div className="text-xs text-gray-400">
                        Confidence: {Math.round(rec.confidenceLevel * 100)}%
                      </div>
                    </div>
                  </div>

                  {/* Personalized Reasons */}
                  <div className="mb-4">
                    <div className="text-sm text-gray-300 mb-2 font-semibold">Why this matches you:</div>
                    <div className="flex flex-wrap gap-2">
                      {rec.personalizedReasons.map((reason, reasonIndex) => (
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

                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-gray-600 text-gray-300 hover:bg-gray-600"
                      >
                        <Heart className="w-4 h-4" />
                      </Button>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => navigate(`/business/${rec.business.id}`)}
                      className="bg-[#00C2FF] hover:bg-[#00A8D8]"
                    >
                      View Profile
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {lastUpdated && (
            <div className="text-center text-sm text-gray-400">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </div>
          )}
        </>
      )}

      {/* No Recommendations */}
      {!isGenerating && recommendations.length === 0 && (
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-8 text-center">
            <TrendingUp className="w-12 h-12 mx-auto text-gray-500 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">No recommendations yet</h3>
            <p className="text-gray-300 mb-4">
              We're still learning your preferences. Try updating your profile or explore more businesses.
            </p>
            <div className="space-x-2">
              <Button
                onClick={() => navigate('/profile')}
                variant="outline"
                className="border-gray-600 text-gray-300"
              >
                Update Preferences
              </Button>
              <Button
                onClick={generatePersonalizedRecommendations}
                className="bg-[#00C2FF] hover:bg-[#00A8D8]"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PersonalizedRecommendationEngine;
