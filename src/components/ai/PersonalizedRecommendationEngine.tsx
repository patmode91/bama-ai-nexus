
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  Target, 
  Sparkles, 
  ArrowRight, 
  Brain,
  Users,
  Star,
  Zap
} from 'lucide-react';
import { useBusinesses } from '@/hooks/useBusinesses';
import { PersonalizedRecommendation } from '@/types/recommendations';

const PersonalizedRecommendationEngine = () => {
  const [recommendations, setRecommendations] = useState<PersonalizedRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  
  const { data: businesses } = useBusinesses();

  useEffect(() => {
    generatePersonalizedRecommendations();
  }, [businesses]);

  const generatePersonalizedRecommendations = async () => {
    if (!businesses?.length) return;

    setIsLoading(true);
    try {
      // Simulate AI-powered personalized recommendation generation
      await new Promise(resolve => setTimeout(resolve, 1000));

      const mockRecommendations: PersonalizedRecommendation[] = businesses
        .slice(0, 12)
        .map((business, index) => ({
          business,
          relevanceScore: Math.floor(Math.random() * 30) + 70,
          personalizedReasons: [
            'Matches your industry focus',
            'Similar technology stack',
            'Complementary services',
            'Geographic proximity',
            'Growth trajectory alignment'
          ].slice(0, Math.floor(Math.random() * 3) + 2),
          recommendationType: (['perfect_match', 'growth_opportunity', 'trending', 'similar_interests'] as const)[index % 4],
          confidenceLevel: Math.floor(Math.random() * 30) + 70,
        }));

      setRecommendations(mockRecommendations);
    } catch (error) {
      console.error('Error generating recommendations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredRecommendations = activeCategory === 'all' 
    ? recommendations 
    : recommendations.filter(rec => rec.recommendationType === activeCategory);

  const getRecommendationIcon = (type: string) => {
    switch (type) {
      case 'perfect_match': return <Target className="w-4 h-4" />;
      case 'growth_opportunity': return <TrendingUp className="w-4 h-4" />;
      case 'trending': return <Sparkles className="w-4 h-4" />;
      case 'similar_interests': return <Users className="w-4 h-4" />;
      default: return <Star className="w-4 h-4" />;
    }
  };

  const getRecommendationColor = (type: string) => {
    switch (type) {
      case 'perfect_match': return 'bg-green-500';
      case 'growth_opportunity': return 'bg-blue-500';
      case 'trending': return 'bg-purple-500';
      case 'similar_interests': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-8 text-center">
          <Brain className="w-12 h-12 mx-auto text-[#00C2FF] animate-pulse mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">Generating Personalized Recommendations...</h3>
          <p className="text-gray-300">AI is analyzing your preferences and behavior patterns</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-gray-800 to-gray-700 border-gray-600">
        <CardHeader>
          <CardTitle className="flex items-center text-white">
            <TrendingUp className="w-5 h-5 mr-2 text-[#00C2FF]" />
            Personalized AI Recommendations
            <Badge className="ml-3 bg-gradient-to-r from-green-500 to-blue-500 text-white">
              ML-Powered
            </Badge>
          </CardTitle>
          <p className="text-gray-300">
            Smart recommendations tailored to your interests, behavior, and business goals
          </p>
        </CardHeader>
      </Card>

      {/* Recommendation Categories */}
      <Tabs value={activeCategory} onValueChange={setActiveCategory}>
        <TabsList className="bg-gray-800 w-full">
          <TabsTrigger value="all" className="flex-1">All Recommendations</TabsTrigger>
          <TabsTrigger value="perfect_match" className="flex-1">Perfect Matches</TabsTrigger>
          <TabsTrigger value="growth_opportunity" className="flex-1">Growth Opportunities</TabsTrigger>
          <TabsTrigger value="trending" className="flex-1">Trending</TabsTrigger>
        </TabsList>

        <TabsContent value={activeCategory} className="space-y-4">
          {filteredRecommendations.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRecommendations.map((recommendation, index) => (
                <Card key={recommendation.business.id} className="bg-gray-800 border-gray-700 hover:border-[#00C2FF] transition-colors">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h4 className="text-lg font-semibold text-white">
                            {recommendation.business.businessname}
                          </h4>
                          {recommendation.business.verified && (
                            <Badge className="bg-green-500 text-white text-xs">Verified</Badge>
                          )}
                        </div>
                        <p className="text-gray-300 text-sm mb-3 line-clamp-2">
                          {recommendation.business.description}
                        </p>
                      </div>
                    </div>

                    {/* Recommendation Type Badge */}
                    <div className="flex items-center justify-between mb-4">
                      <Badge className={`${getRecommendationColor(recommendation.recommendationType)} text-white flex items-center space-x-1`}>
                        {getRecommendationIcon(recommendation.recommendationType)}
                        <span className="text-xs capitalize">
                          {recommendation.recommendationType.replace('_', ' ')}
                        </span>
                      </Badge>
                      <div className="text-right">
                        <div className="text-lg font-bold text-[#00C2FF]">
                          {recommendation.relevanceScore}%
                        </div>
                        <div className="text-xs text-gray-400">Relevance</div>
                      </div>
                    </div>

                    {/* Personalized Reasons */}
                    <div className="mb-4">
                      <div className="text-sm text-gray-300 mb-2">Why this matches you:</div>
                      <div className="flex flex-wrap gap-1">
                        {recommendation.personalizedReasons.slice(0, 3).map((reason, reasonIndex) => (
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

                    {/* Confidence Level */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Confidence</span>
                        <span className="text-white font-medium">{recommendation.confidenceLevel}%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2 mt-1">
                        <div 
                          className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${recommendation.confidenceLevel}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="text-sm text-gray-400">
                        {recommendation.business.location} • {recommendation.business.category}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-[#00C2FF] hover:text-[#00A8D8] hover:bg-gray-700"
                      >
                        Connect
                        <ArrowRight className="w-3 h-3 ml-1" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-8 text-center">
                <Brain className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No Recommendations Yet</h3>
                <p className="text-gray-400 mb-4">
                  Interact with more businesses to get personalized recommendations
                </p>
                <Button 
                  onClick={generatePersonalizedRecommendations}
                  className="bg-[#00C2FF] hover:bg-[#00A8D8]"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Generate Recommendations
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Refresh Button */}
      <div className="text-center">
        <Button 
          onClick={generatePersonalizedRecommendations}
          disabled={isLoading}
          variant="outline"
          className="border-gray-600 text-gray-300 hover:bg-gray-700"
        >
          <TrendingUp className="w-4 h-4 mr-2" />
          Refresh Recommendations
        </Button>
      </div>
    </div>
  );
};

export default PersonalizedRecommendationEngine;
