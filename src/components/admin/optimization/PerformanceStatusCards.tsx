
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Zap, Settings, TrendingUp } from 'lucide-react';

interface PerformanceStatusCardsProps {
  score: number;
  optimizationHistoryCount: number;
}

const PerformanceStatusCards = ({ score, optimizationHistoryCount }: PerformanceStatusCardsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="bg-gray-900/80 backdrop-blur-sm border-gray-700">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 rounded-lg bg-blue-400/10">
              <Zap className="w-5 h-5 text-blue-400" />
            </div>
            <Badge 
              variant={score >= 80 ? 'default' : 'destructive'}
              className={`${score >= 80 ? 'bg-green-400/20 text-green-400' : 'bg-red-400/20 text-red-400'}`}
            >
              {score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : 'Needs Work'}
            </Badge>
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-300">Current Performance Score</h3>
            <p className="text-2xl font-bold text-white">{score.toFixed(1)}/100</p>
            <Progress value={score} className="h-2 bg-gray-700" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gray-900/80 backdrop-blur-sm border-gray-700">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 rounded-lg bg-green-400/10">
              <Settings className="w-5 h-5 text-green-400" />
            </div>
            <Badge variant="secondary" className="bg-gray-700/50">
              Active
            </Badge>
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-300">Auto-Optimization</h3>
            <p className="text-2xl font-bold text-white">Enabled</p>
            <p className="text-xs text-gray-400">Every 30 minutes</p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gray-900/80 backdrop-blur-sm border-gray-700">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 rounded-lg bg-purple-400/10">
              <TrendingUp className="w-5 h-5 text-purple-400" />
            </div>
            <Badge variant="secondary" className="bg-gray-700/50">
              {optimizationHistoryCount}
            </Badge>
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-300">Optimizations Applied</h3>
            <p className="text-2xl font-bold text-white">Today</p>
            <p className="text-xs text-gray-400">Last 24 hours</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PerformanceStatusCards;
