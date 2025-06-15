
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertTriangle, XCircle, Activity, TrendingUp } from 'lucide-react';
import { getHealthColor } from './systemHealthUtils';

interface HealthMetric {
  id: string;
  name: string;
  value: number;
  status: 'healthy' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
  lastUpdated: number;
}

interface OverviewTabProps {
  metrics: HealthMetric[];
}

const OverviewTab = ({ metrics }: OverviewTabProps) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      case 'critical': return <XCircle className="w-4 h-4 text-red-400" />;
      default: return <Activity className="w-4 h-4 text-gray-400" />;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-3 h-3 text-green-400" />;
      case 'down': return <TrendingUp className="w-3 h-3 text-red-400 rotate-180" />;
      default: return <Activity className="w-3 h-3 text-gray-400" />;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {metrics.map((metric) => (
        <Card key={metric.id} className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                {getStatusIcon(metric.status)}
                <span className="font-medium text-white">{metric.name}</span>
              </div>
              {getTrendIcon(metric.trend)}
            </div>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-white">
                {typeof metric.value === 'number' ? metric.value.toFixed(1) : metric.value}
              </div>
              <Badge className={getHealthColor(metric.status)}>
                {metric.status}
              </Badge>
            </div>
            <div className="text-xs text-gray-400 mt-2">
              Updated: {new Date(metric.lastUpdated).toLocaleTimeString()}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default OverviewTab;
