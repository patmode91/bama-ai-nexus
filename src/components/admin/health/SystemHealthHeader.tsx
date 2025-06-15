
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

interface SystemHealthHeaderProps {
  autoRefresh: boolean;
  isLoading: boolean;
  onAutoRefreshToggle: () => void;
  onRefresh: () => void;
}

const SystemHealthHeader = ({ 
  autoRefresh, 
  isLoading, 
  onAutoRefreshToggle, 
  onRefresh 
}: SystemHealthHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-2xl font-bold text-white">System Health Monitor</h2>
        <p className="text-gray-400">Real-time system performance and health metrics</p>
      </div>
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={onAutoRefreshToggle}
          className={autoRefresh ? 'border-green-500 text-green-400' : 'border-gray-600'}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
          Auto Refresh: {autoRefresh ? 'ON' : 'OFF'}
        </Button>
        <Button onClick={onRefresh} disabled={isLoading} size="sm">
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh Now
        </Button>
      </div>
    </div>
  );
};

export default SystemHealthHeader;
