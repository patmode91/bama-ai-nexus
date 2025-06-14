
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { useBusinesses } from '@/hooks/useBusinesses';
import { Sparkles, ArrowRight, Heart, Building2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PersonalizedRecommendations = () => {
  const { preferences, getMatchingCriteria } = useUserPreferences();
  const { data: businesses } = useBusinesses();
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (businesses && preferences.industries.length > 0) {
      const criteria = getMatchingCriteria();
      
      // Simple matching algorithm based on user preferences
      const scored = businesses
        .map(business => {
          let score = 0;
          
          // Industry match
          if (criteria.industries.some(industry => 
            business.category?.toLowerCase().includes(industry.toLowerCase()) ||
            business.description?.toLowerCase().includes(industry.toLowerCase())
          )) {
            score += 40;
          }
          
          // Budget compatibility
          if (business.project_budget_min && business.project_budget_max) {
            const userMin = criteria.budget.min;
            const userMax = criteria.budget.max;
            const bizMin = business.project_budget_min;
            const bizMax = business.project_budget_max;
            
            if ((userMin <= bizMax && userMax >= bizMin)) {
              score += 30;
            }
          }
          
          // Location preference
          if (criteria.location && business.location?.toLowerCase().includes(criteria.location.toLowerCase())) {
            score += 20;
          }
          
          // AI focus areas in description or tags
          const aiMatch = criteria.aiAreas.some(area =>
            business.description?.toLowerCase().includes(area.toLowerCase()) ||
            business.tags?.some(tag => tag.toLowerCase().includes(area.toLowerCase()))
          );
          if (aiMatch) {
            score += 30;
          }

          return { ...business, matchScore: score };
        })
        .filter(business => business.matchScore > 0)
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, 6);

      setRecommendations(scored);
    }
  }, [businesses, preferences]);

  if (recommendations.length === 0) {
    return (
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#00C2FF]" />
            Personalized Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-400 text-center py-8">
            Complete your profile preferences to see personalized business recommendations.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-[#00C2FF]" />
          Recommended for You
        </CardTitle>
        <p className="text-gray-400 text-sm">
          Based on your preferences for {preferences.industries.slice(0, 2).join(', ')}
          {preferences.industries.length > 2 && ` and ${preferences.industries.length - 2} more`}
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {recommendations.map((business) => (
            <div
              key={business.id}
              className="p-4 bg-gray-700 rounded-lg border border-gray-600 hover:border-[#00C2FF] transition-colors"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-1">
                    {business.businessname}
                  </h3>
                  <p className="text-gray-300 text-sm mb-2 line-clamp-2">
                    {business.description}
                  </p>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <Badge variant="secondary" className="bg-[#00C2FF]/20 text-[#00C2FF]">
                    {business.matchScore}% match
                  </Badge>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <span className="flex items-center gap-1">
                    <Building2 className="w-4 h-4" />
                    {business.category}
                  </span>
                  {business.location && (
                    <span>{business.location}</span>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-gray-600 text-gray-300 hover:bg-gray-600"
                  >
                    <Heart className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => navigate(`/business/${business.id}`)}
                    className="bg-[#00C2FF] hover:bg-[#00A8D8]"
                  >
                    View Profile
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {recommendations.length > 0 && (
          <div className="mt-6 text-center">
            <Button
              variant="outline"
              onClick={() => navigate('/ai-search')}
              className="border-[#00C2FF] text-[#00C2FF] hover:bg-[#00C2FF]/10"
            >
              Find More Matches with AI Search
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PersonalizedRecommendations;
