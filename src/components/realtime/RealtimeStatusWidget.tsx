
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Activity, 
  Wifi, 
  WifiOff, 
  Zap, 
  Users,
  MessageSquare,
  TrendingUp
} from 'lucide-react';
import { useRealtimeIntegration } from '@/hooks/useRealtimeIntegration';

interface RealtimeStatusWidgetProps {
  channel?: string;
  compact?: boolean;
  showOptimization?: boolean;
}

const RealtimeStatusWidget: React.FC<RealtimeStatusWidgetProps> = ({
  channel = 'status-widget',
  compact = false,
  showOptimization = true
}) => {
  const {
    connectionStatus,
    connectionHealth,
    metrics,
    isConnected,
    isOptimized,
    forceOptimization
  } = useRealtimeIntegration(channel, {
    enablePerformanceTracking: true,
    enableAutoOptimization: true
  });

  const getStatusIcon = () => {
    if (!isConnected) return <WifiOff className="w-4 h-4 text-red-400" />;
    if (connectionHealth === 'excellent') return <Wifi className="w-4 h-4 text-green-400" />;
    if (connectionHealth === 'fair') return <Activity className="w-4 h-4 text-yellow-400" />;
    return <Activity className="w-4 h-4 text-red-400" />;
  };

  const getStatusColor = () => {
    if (!isConnected) return 'destructive';
    if (connectionHealth === 'excellent') return 'default';
    if (connectionHealth === 'fair') return 'secondary';
    return 'destructive';
  };

  if (compact) {
    return (
      <div className="flex items-center space-x-2">
        {getStatusIcon()}
        <Badge variant={getStatusColor()} className="text-xs">
          {isConnected ? connectionHealth : 'offline'}
        </Badge>
        <span className="text-xs text-gray-400">
          {metrics.connectionLatency.toFixed(0)}ms
        </span>
      </div>
    );
  }

  return (
    <Card className="bg-gray-900/80 backdrop-blur-sm border-gray-700">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            {getStatusIcon()}
            <span className="font-medium">Real-time Status</span>
          </div>
          <Badge variant={getStatusColor()}>
            {connectionStatus}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center">
            <div className="text-lg font-bold text-blue-400">
              {metrics.connectionLatency.toFixed(0)}
            </div>
            <div className="text-xs text-gray-400">Latency (ms)</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-green-400">
              {metrics.messageRate.toFixed(1)}
            </div>
            <div className="text-xs text-gray-400">Events/sec</div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex space-x-1">
            <Users className="w-4 h-4 text-gray-400" />
            <MessageSquare className="w-4 h-4 text-gray-400" />
            <TrendingUp className="w-4 h-4 text-gray-400" />
          </div>
          
          {showOptimization && (
            <Button
              size="sm"
              onClick={forceOptimization}
              disabled={isOptimized}
              className="bg-[#00C2FF] hover:bg-[#0099CC] text-xs"
            >
              <Zap className="w-3 h-3 mr-1" />
              {isOptimized ? 'Optimized' : 'Optimize'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RealtimeStatusWidget;
