
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Heart } from 'lucide-react';
import { getHealthColor } from './systemHealthUtils';

interface HealthMetric {
  id: string;
  name: string;
  value: number;
  status: 'healthy' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
  lastUpdated: number;
}

interface OverallHealthCardProps {
  healthData: any;
  metrics: HealthMetric[];
}

const OverallHealthCard = ({ healthData, metrics }: OverallHealthCardProps) => {
  const overallHealthScore = healthData?.score || 0;

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Heart className="w-5 h-5 text-red-400" />
          Overall System Health
          <Badge className={getHealthColor(healthData?.overall || 'unknown')}>
            {(healthData?.overall || 'unknown').toUpperCase()}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-white mb-2">{overallHealthScore}</div>
            <div className="text-sm text-gray-400 mb-2">Health Score</div>
            <Progress value={overallHealthScore} className="h-2" />
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400 mb-2">
              {metrics.filter(m => m.status === 'healthy').length}
            </div>
            <div className="text-sm text-gray-400">Healthy Services</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-400 mb-2">
              {metrics.filter(m => m.status === 'warning').length}
            </div>
            <div className="text-sm text-gray-400">Warnings</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-400 mb-2">
              {metrics.filter(m => m.status === 'critical').length}
            </div>
            <div className="text-sm text-gray-400">Critical Issues</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OverallHealthCard;
