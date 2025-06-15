
import React from 'react';
import { Wifi, WifiOff, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { realtimeService } from '@/services/realtime/realtimeService';

interface ConnectionStatusProps {
  className?: string;
}

const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ className = '' }) => {
  const [status, setStatus] = React.useState(realtimeService.getConnectionStatus());

  React.useEffect(() => {
    const interval = setInterval(() => {
      setStatus(realtimeService.getConnectionStatus());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'connected':
        return {
          icon: <Wifi className="h-3 w-3" />,
          label: 'Live',
          variant: 'default' as const,
          color: 'bg-green-500'
        };
      case 'connecting':
        return {
          icon: <AlertCircle className="h-3 w-3" />,
          label: 'Connecting',
          variant: 'secondary' as const,
          color: 'bg-yellow-500'
        };
      default:
        return {
          icon: <WifiOff className="h-3 w-3" />,
          label: 'Offline',
          variant: 'destructive' as const,
          color: 'bg-red-500'
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className={`w-2 h-2 rounded-full ${config.color} animate-pulse`} />
      <Badge variant={config.variant} className="text-xs flex items-center gap-1">
        {config.icon}
        {config.label}
      </Badge>
    </div>
  );
};

export default ConnectionStatus;
