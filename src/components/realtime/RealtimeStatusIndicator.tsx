
import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Wifi, WifiOff, Activity } from 'lucide-react';
import { useRealtime } from '@/hooks/useRealtime';

const RealtimeStatusIndicator = () => {
  const { connectionStatus, isConnected } = useRealtime({ 
    channel: 'system-status',
    enabled: true 
  });

  const getStatusIcon = () => {
    if (isConnected) {
      return <Wifi className="w-3 h-3" />;
    }
    if (connectionStatus === 'connecting') {
      return <Activity className="w-3 h-3 animate-spin" />;
    }
    return <WifiOff className="w-3 h-3" />;
  };

  const getStatusVariant = () => {
    if (isConnected) return 'default';
    if (connectionStatus === 'connecting') return 'secondary';
    return 'destructive';
  };

  const getStatusText = () => {
    if (isConnected) return 'Live';
    if (connectionStatus === 'connecting') return 'Connecting';
    return 'Offline';
  };

  return (
    <Badge variant={getStatusVariant()} className="flex items-center space-x-1">
      {getStatusIcon()}
      <span className="text-xs">{getStatusText()}</span>
    </Badge>
  );
};

export default RealtimeStatusIndicator;
