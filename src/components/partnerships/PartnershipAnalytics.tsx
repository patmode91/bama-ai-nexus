
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  DollarSign, 
  Clock, 
  Target,
  Users,
  Zap
} from 'lucide-react';
import { PartnershipService } from '@/services/partnershipService';
import { Partnership } from '@/types/partnerships';

interface PartnershipAnalyticsProps {
  partnership: Partnership;
}

export const PartnershipAnalytics: React.FC<PartnershipAnalyticsProps> = ({ partnership }) => {
  const roi = PartnershipService.calculateROI(partnership);

  return (
    <div className="space-y-6">
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-[#00C2FF]" />
            <span>Partnership ROI Analysis</span>
            <Badge className="bg-green-600 text-white">
              Score: {roi.overallScore.toFixed(1)}/10
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* ROI Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gray-700/50 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <DollarSign className="w-4 h-4 text-green-400" />
                <span className="text-sm text-gray-400">Cost Savings</span>
              </div>
              <div className="text-xl font-bold text-white">
                ${roi.costSavings.toLocaleString()}
              </div>
              <div className="text-xs text-gray-500">Annual estimated</div>
            </div>

            <div className="bg-gray-700/50 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Clock className="w-4 h-4 text-blue-400" />
                <span className="text-sm text-gray-400">Time Efficiency</span>
              </div>
              <div className="text-xl font-bold text-white">
                {roi.timeEfficiency.toLocaleString()}h
              </div>
              <div className="text-xs text-gray-500">Hours saved monthly</div>
            </div>

            <div className="bg-gray-700/50 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Target className="w-4 h-4 text-purple-400" />
                <span className="text-sm text-gray-400">Match Success</span>
              </div>
              <div className="text-xl font-bold text-white">
                {roi.matchSuccess.toFixed(1)}%
              </div>
              <div className="text-xs text-gray-500">Query-to-match ratio</div>
            </div>

            <div className="bg-gray-700/50 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Users className="w-4 h-4 text-[#00C2FF]" />
                <span className="text-sm text-gray-400">User Engagement</span>
              </div>
              <div className="text-xl font-bold text-white">
                {partnership.metrics.activeUsers.toLocaleString()}
              </div>
              <div className="text-xs text-gray-500">Active users</div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="space-y-4">
            <h4 className="text-white font-medium">Performance Indicators</h4>
            
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">Agent Query Volume</span>
                  <span className="text-white">{partnership.metrics.agentQueries.toLocaleString()}</span>
                </div>
                <Progress value={Math.min((partnership.metrics.agentQueries / 10000) * 100, 100)} className="h-2" />
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">Data Contributions</span>
                  <span className="text-white">{partnership.metrics.dataContributions}</span>
                </div>
                <Progress value={Math.min((partnership.metrics.dataContributions / 200) * 100, 100)} className="h-2" />
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">Successful Matches</span>
                  <span className="text-white">{partnership.metrics.successfulMatches}</span>
                </div>
                <Progress value={Math.min((partnership.metrics.successfulMatches / 500) * 100, 100)} className="h-2" />
              </div>
            </div>
          </div>

          {/* Value Proposition */}
          <div className="bg-[#00C2FF]/10 border border-[#00C2FF]/30 p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Zap className="w-4 h-4 text-[#00C2FF]" />
              <span className="text-[#00C2FF] font-medium">Partnership Value</span>
            </div>
            <p className="text-sm text-gray-300">
              This partnership is generating significant value through AI-powered business matching 
              and data contributions. The high ROI score indicates strong engagement and successful 
              outcomes for both parties.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
