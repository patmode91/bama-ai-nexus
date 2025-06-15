
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sparkles, TrendingUp, Target, Brain } from 'lucide-react';
import { useMCP } from '@/hooks/useMCP';
import { useBusinesses } from '@/hooks/useBusinesses';

interface PersonalizedRecommendation {
  business: any;
  score: number;
  reasoning: string;
  category: 'trending' | 'perfect_match' | 'emerging' | 'strategic';
  insights: string[];
}

interface PersonalizedRecommendationEngineProps {
  userId?: string;
  userPreferences?: {
    industry?: string;
    budget?: { min: number; max: number };
    location?: string;
    services?: string[];
  };
}

const PersonalizedRecommendationEngine = ({ 
  userId, 
  userPreferences 
}: PersonalizedRecommendationEngineProps) => {
  const [recommendations, setRecommendations] = useState<PersonalizedRecommendation[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const { runFullAnalysis, isLoading } = useMCP(userId);
  const { data: businesses } = useBusinesses();

  const generateRecommendations = async () => {
    if (!businesses || businesses.length === 0) return;

    setIsGenerating(true);
    try {
      // Create a personalized query based on user preferences
      const query = buildPersonalizedQuery(userPreferences);
      
      // Run MCP analysis with personalized context
      const results = await runFullAnalysis('personalized_recommendations', {
        userPreferences,
        query,
        source: 'recommendation_engine'
      });

      // Process results into personalized recommendations
      const personalizedRecs = processIntoRecommendations(results, businesses);
      setRecommendations(personalizedRecs);
    } catch (error) {
      console.error('Error generating personalized recommendations:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const buildPersonalizedQuery = (preferences: any) => {
    if (!preferences) return 'Find innovative Alabama businesses';
    
    let query = 'Find';
    if (preferences.industry) query += ` ${preferences.industry}`;
    query += ' businesses in Alabama';
    if (preferences.location) query += ` near ${preferences.location}`;
    if (preferences.services?.length > 0) {
      query += ` offering ${preferences.services.join(', ')}`;
    }
    if (preferences.budget) {
      query += ` with budget range $${preferences.budget.min.toLocaleString()} - $${preferences.budget.max.toLocaleString()}`;
    }
    
    return query;
  };

  const processIntoRecommendations = (results: any, allBusinesses: any[]): PersonalizedRecommendation[] => {
    const recs: PersonalizedRecommendation[] = [];

    // Process Connector matches for perfect matches
    if (results.connector?.matches) {
      results.connector.matches.slice(0, 3).forEach((match: any) => {
        recs.push({
          business: match.business,
          score: match.score,
          reasoning: match.reasoning,
          category: match.score > 85 ? 'perfect_match' : 'strategic',
          insights: [`${match.score}% compatibility match`]
        });
      });
    }

    // Process Analyst insights for trending businesses
    if (results.analyst?.insights) {
      const trending = allBusinesses
        .filter(b => b.category === results.analyst.insights.sector)
        .slice(0, 2)
        .map(business => ({
          business,
          score: 75 + Math.random() * 20,
          reasoning: `Trending in ${results.analyst.insights.sector} sector`,
          category: 'trending' as const,
          insights: [
            `Market trend: ${results.analyst.insights.marketTrend}`,
            `Demand level: ${results.analyst.insights.demandLevel}`
          ]
        }));
      
      recs.push(...trending);
    }

    // Process Curator suggestions for emerging opportunities
    if (results.curator?.suggestions) {
      const emerging = allBusinesses
        .filter(b => !recs.find(r => r.business.id === b.id))
        .slice(0, 2)
        .map(business => ({
          business,
          score: 60 + Math.random() * 25,
          reasoning: 'Emerging opportunity with high growth potential',
          category: 'emerging' as const,
          insights: results.curator.suggestions.slice(0, 2)
        }));
      
      recs.push(...emerging);
    }

    return recs.sort((a, b) => b.score - a.score).slice(0, 6);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'perfect_match': return <Target className="w-4 h-4" />;
      case 'trending': return <TrendingUp className="w-4 h-4" />;
      case 'emerging': return <Sparkles className="w-4 h-4" />;
      case 'strategic': return <Brain className="w-4 h-4" />;
      default: return <Sparkles className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'perfect_match': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'trending': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'emerging': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'strategic': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  useEffect(() => {
    if (businesses && businesses.length > 0) {
      generateRecommendations();
    }
  }, [businesses, userPreferences]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Personalized Recommendations
          </h2>
          <p className="text-gray-400">
            AI-powered business recommendations tailored to your preferences
          </p>
        </div>
        <Button 
          onClick={generateRecommendations}
          disabled={isGenerating || isLoading}
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
        >
          {isGenerating || isLoading ? (
            <>
              <Sparkles className="w-4 h-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Brain className="w-4 h-4 mr-2" />
              Refresh
            </>
          )}
        </Button>
      </div>

      {recommendations.length > 0 && (
        <div className="grid gap-4">
          {recommendations.map((rec, index) => (
            <Card key={`${rec.business.id}-${index}`} className="bg-gray-800 border-gray-700">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CardTitle className="text-white text-lg">
                      {rec.business.businessname}
                    </CardTitle>
                    <Badge className={`${getCategoryColor(rec.category)} border`}>
                      {getCategoryIcon(rec.category)}
                      <span className="ml-1 capitalize">{rec.category.replace('_', ' ')}</span>
                    </Badge>
                  </div>
                  <Badge variant="outline" className="text-white border-gray-600">
                    {Math.round(rec.score)}% Match
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 mb-3">{rec.reasoning}</p>
                
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-300">AI Insights:</h4>
                  <ul className="text-sm text-gray-400 space-y-1">
                    {rec.insights.map((insight, idx) => (
                      <li key={idx} className="flex items-start">
                        <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                        {insight}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-700">
                  <div className="text-sm text-gray-400">
                    {rec.business.category} • {rec.business.location}
                  </div>
                  <Button variant="outline" size="sm" className="text-blue-400 border-blue-500/30 hover:bg-blue-500/10">
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {recommendations.length === 0 && !isGenerating && !isLoading && (
        <Card className="bg-gray-800 border-gray-700 text-center p-8">
          <CardContent>
            <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-400 mb-4">
              No personalized recommendations available yet.
            </p>
            <Button onClick={generateRecommendations} className="bg-blue-600 hover:bg-blue-700">
              Generate Recommendations
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PersonalizedRecommendationEngine;
