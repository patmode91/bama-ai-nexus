
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, AlertTriangle, XCircle, Activity } from 'lucide-react';

interface HealthMetric {
  id: string;
  name: string;
  value: number;
  status: 'healthy' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
  lastUpdated: number;
}

interface AlertsTabProps {
  metrics: HealthMetric[];
}

const AlertsTab = ({ metrics }: AlertsTabProps) => {
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
        <CardTitle className="text-white">System Alerts</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {metrics.filter(m => m.status !== 'healthy').length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
              <div className="text-lg font-medium text-white">All Systems Operational</div>
              <div className="text-gray-400">No active alerts or issues detected</div>
            </div>
          ) : (
            metrics
              .filter(m => m.status !== 'healthy')
              .map(metric => (
                <div key={metric.id} className="flex items-center gap-4 p-4 bg-gray-700 rounded-lg">
                  {getStatusIcon(metric.status)}
                  <div className="flex-1">
                    <div className="font-medium text-white">{metric.name}</div>
                    <div className="text-sm text-gray-400">
                      Current value: {metric.value} - Status: {metric.status}
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(metric.lastUpdated).toLocaleString()}
                  </div>
                </div>
              ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AlertsTab;
