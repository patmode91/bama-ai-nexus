
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Wifi, WifiOff, AlertCircle } from 'lucide-react';
import { realtimeService } from '@/services/realtime/realtimeService';

const RealtimeStatusIndicator: React.FC = () => {
  const [status, setStatus] = React.useState(realtimeService.getConnectionStatus());

  React.useEffect(() => {
    const interval = setInterval(() => {
      setStatus(realtimeService.getConnectionStatus());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const getStatusConfig = () => {
    switch (status) {
      case 'connected':
        return {
          icon: <Wifi className="h-3 w-3" />,
          label: 'Connected',
          variant: 'default' as const,
          className: 'bg-green-600 text-white'
        };
      case 'connecting':
        return {
          icon: <AlertCircle className="h-3 w-3" />,
          label: 'Connecting...',
          variant: 'secondary' as const,
          className: 'bg-yellow-600 text-white'
        };
      default:
        return {
          icon: <WifiOff className="h-3 w-3" />,
          label: 'Disconnected',
          variant: 'destructive' as const,
          className: 'bg-red-600 text-white'
        };
    }
  };

  const config = getStatusConfig();

  return (
    <Badge variant={config.variant} className={`flex items-center gap-1 ${config.className}`}>
      {config.icon}
      {config.label}
    </Badge>
  );
};

export default RealtimeStatusIndicator;
