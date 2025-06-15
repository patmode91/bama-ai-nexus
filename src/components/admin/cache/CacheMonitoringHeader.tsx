
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Database, RefreshCw, Trash2, Activity } from 'lucide-react';

interface CacheMonitoringHeaderProps {
  refreshing: boolean;
  onRefresh: () => void;
  onCleanup: () => void;
  onClearAll: () => void;
}

export const CacheMonitoringHeader: React.FC<CacheMonitoringHeaderProps> = ({
  refreshing,
  onRefresh,
  onCleanup,
  onClearAll
}) => {
  return (
    <Card className="bg-gradient-to-r from-gray-800 to-gray-700 border-gray-600">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-white">
          <div className="flex items-center">
            <Database className="w-6 h-6 mr-2 text-[#00C2FF]" />
            Advanced Cache Monitoring
            <Badge className="ml-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white">
              Multi-Layer
            </Badge>
          </div>
          <div className="flex space-x-2">
            <Button
              onClick={onCleanup}
              variant="outline"
              size="sm"
              className="border-gray-600 text-gray-300"
            >
              <Activity className="w-4 h-4 mr-1" />
              Cleanup
            </Button>
            <Button
              onClick={onRefresh}
              disabled={refreshing}
              variant="outline"
              size="sm"
              className="border-gray-600 text-gray-300"
            >
              <RefreshCw className={`w-4 h-4 mr-1 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              onClick={onClearAll}
              variant="destructive"
              size="sm"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Clear All
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
    </Card>
  );
};
