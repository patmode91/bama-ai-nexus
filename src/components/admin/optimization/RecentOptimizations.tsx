
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, AlertTriangle } from 'lucide-react';

interface OptimizationHistory {
  rule: string;
  timestamp: number;
  success: boolean;
  performance: number;
}

interface RecentOptimizationsProps {
  optimizationHistory: OptimizationHistory[];
}

const RecentOptimizations = ({ optimizationHistory }: RecentOptimizationsProps) => {
  return (
    <Card className="bg-gray-900/80 backdrop-blur-sm border-gray-700">
      <CardHeader>
        <CardTitle className="text-white">Recent Optimizations</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {optimizationHistory.length === 0 ? (
          <div className="text-center py-8">
            <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-300">No optimizations yet</p>
            <p className="text-sm text-gray-400">Run your first optimization to see results</p>
          </div>
        ) : (
          optimizationHistory.map((optimization, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
              <div className="flex items-center space-x-3">
                {optimization.success ? (
                  <CheckCircle className="w-4 h-4 text-green-400" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                )}
                <div>
                  <p className="text-sm font-medium text-white">{optimization.rule}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(optimization.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-white">{optimization.performance.toFixed(1)}</p>
                <p className="text-xs text-gray-400">score</p>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};

export default RecentOptimizations;
