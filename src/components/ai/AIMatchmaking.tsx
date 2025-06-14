
import { useState, useEffect } from 'react';
import { Sparkles, TrendingUp, Users, MapPin, Star, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { aiService } from '@/services/aiService';
import { useBusinesses } from '@/hooks/useBusinesses';
import AIMatchingEngine from './AIMatchingEngine';

interface AIMatchmakingProps {
  userAnswers?: Record<string, string>;
  onViewProfile: (companyId: number) => void;
}

const AIMatchmaking = ({ userAnswers, onViewProfile }: AIMatchmakingProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const { data: businesses } = useBusinesses();

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center text-white">
            <Sparkles className="w-5 h-5 mr-2 text-[#00C2FF] animate-pulse" />
            Enhanced AI is analyzing your preferences...
            <Badge className="ml-2 bg-purple-500 text-white">AI 2.0</Badge>
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

  // Transform userAnswers to userProfile format
  const userProfile = userAnswers ? {
    industry: userAnswers.industry,
    location: userAnswers.location,
    companySize: userAnswers.company_size,
    timeline: userAnswers.urgency,
    projectType: userAnswers.service_type
  } : undefined;

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center text-white">
          <Sparkles className="w-5 h-5 mr-2 text-[#00C2FF]" />
          Enhanced AI Business Matching
          <Badge className="ml-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white">
            AI 2.0
          </Badge>
        </CardTitle>
        <p className="text-gray-300">
          Advanced algorithms analyzing {businesses?.length || 0} businesses for perfect matches
        </p>
      </CardHeader>
      
      <CardContent>
        <AIMatchingEngine 
          userProfile={userProfile}
          onViewProfile={onViewProfile}
        />
      </CardContent>
    </Card>
  );
};

export default AIMatchmaking;
