
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, AlertTriangle, XCircle, Activity } from 'lucide-react';

interface HealthMetric {
  id: string;
  name: string;
  value: number;
  status: 'healthy' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
  lastUpdated: number;
}

interface PerformanceTabProps {
  metrics: HealthMetric[];
}

const PerformanceTab = ({ metrics }: PerformanceTabProps) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      case 'critical': return <XCircle className="w-4 h-4 text-red-400" />;
      default: return <Activity className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white">Performance Metrics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Response Times</h3>
            {metrics.filter(m => m.id.includes('response') || m.id.includes('api')).map(metric => (
              <div key={metric.id} className="flex items-center justify-between">
                <span className="text-gray-300">{metric.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-white font-medium">{metric.value.toFixed(0)}ms</span>
                  {getStatusIcon(metric.status)}
                </div>
              </div>
            ))}
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">System Resources</h3>
            {metrics.filter(m => m.id.includes('memory') || m.id.includes('cpu')).map(metric => (
              <div key={metric.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">{metric.name}</span>
                  <span className="text-white font-medium">{metric.value.toFixed(1)}%</span>
                </div>
                <Progress value={metric.value} className="h-2" />
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PerformanceTab;
