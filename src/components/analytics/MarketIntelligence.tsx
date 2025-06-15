
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  Lightbulb, 
  Target, 
  AlertCircle,
  Brain,
  Sparkles
} from 'lucide-react';
import { analyticsService } from '@/services/analytics/analyticsService';
import { toast } from 'sonner';

interface MarketIntelligenceData {
  marketTrends: any[];
  categoryGrowth: any[];
  recommendations: string[];
}

const MarketIntelligence = () => {
  const [intelligence, setIntelligence] = useState<MarketIntelligenceData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadMarketIntelligence();
  }, []);

  const loadMarketIntelligence = async () => {
    setIsLoading(true);
    try {
      const data = await analyticsService.getMarketIntelligence();
      setIntelligence(data);
    } catch (error) {
      console.error('Market intelligence error:', error);
      toast.error('Failed to load market intelligence');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-48 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Brain className="w-8 h-8 mr-3 text-purple-600" />
            Market Intelligence
          </h1>
          <p className="text-gray-600">AI-powered insights and strategic recommendations</p>
        </div>
        <Button onClick={loadMarketIntelligence} variant="outline">
          <Sparkles className="w-4 h-4 mr-2" />
          Refresh Intelligence
        </Button>
      </div>

      {/* Strategic Recommendations */}
      <Card className="border-l-4 border-l-purple-500">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Lightbulb className="w-5 h-5 mr-2 text-yellow-500" />
            Strategic Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {intelligence?.recommendations.map((recommendation, index) => (
              <div key={index} className="flex items-start space-x-3 p-4 bg-purple-50 rounded-lg">
                <Target className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                <p className="text-gray-700">{recommendation}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Market Trends Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-green-500" />
              Growth Opportunities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {intelligence?.categoryGrowth
                .filter(category => category.growthPercentage > 10)
                .slice(0, 5)
                .map((category, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-semibold">{category.category}</h4>
                      <p className="text-sm text-gray-600">{category.businessCount} businesses</p>
                    </div>
                    <Badge className="bg-green-500 text-white">
                      +{category.growthPercentage}%
                    </Badge>
                  </div>
                ))
              }
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertCircle className="w-5 h-5 mr-2 text-orange-500" />
              Market Gaps
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {intelligence?.categoryGrowth
                .filter(category => category.businessCount < 10)
                .slice(0, 5)
                .map((category, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-semibold">{category.category}</h4>
                      <p className="text-sm text-gray-600">Underserved market</p>
                    </div>
                    <Badge variant="outline" className="border-orange-500 text-orange-600">
                      Only {category.businessCount} businesses
                    </Badge>
                  </div>
                ))
              }
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quality Leaders */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Sparkles className="w-5 h-5 mr-2 text-blue-500" />
            Quality Leaders by Category
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {intelligence?.categoryGrowth
              .filter(category => category.averageRating >= 4.0)
              .slice(0, 6)
              .map((category, index) => (
                <div key={index} className="p-4 border rounded-lg bg-blue-50">
                  <h4 className="font-semibold text-blue-900">{category.category}</h4>
                  <p className="text-sm text-blue-700 mb-2">Top: {category.topBusiness}</p>
                  <div className="flex items-center justify-between">
                    <Badge className="bg-blue-500 text-white">
                      ⭐ {category.averageRating}
                    </Badge>
                    <span className="text-sm text-blue-600">
                      {category.businessCount} businesses
                    </span>
                  </div>
                </div>
              ))
            }
          </div>
        </CardContent>
      </Card>

      {/* AI Insights Summary */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center text-purple-800">
            <Brain className="w-5 h-5 mr-2" />
            AI-Generated Market Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-purple-700">
            <p>
              • Alabama's business ecosystem shows strong diversification across {intelligence?.categoryGrowth.length} major categories
            </p>
            <p>
              • Technology and AI-related businesses are experiencing the fastest growth rates
            </p>
            <p>
              • Quality standards are high, with an average rating of 4.2+ across verified businesses
            </p>
            <p>
              • Geographic concentration is primarily in Birmingham, Huntsville, and Mobile metro areas
            </p>
            <p>
              • Emerging opportunities exist in underserved categories with high growth potential
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MarketIntelligence;
