
import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Users } from 'lucide-react';
import { useRealtime } from '@/hooks/useRealtime';

const LiveUserCounter = () => {
  const [userCount, setUserCount] = useState(0);
  
  const { events } = useRealtime({
    channel: 'user-presence',
    eventTypes: ['user_activity'],
    onEvent: (event) => {
      if (event.type === 'user_activity') {
        setUserCount(event.data?.activeUsers || 0);
      }
    }
  });

  useEffect(() => {
    // Simulate initial user count
    setUserCount(Math.floor(Math.random() * 200) + 50);
    
    // Simulate fluctuating user count
    const interval = setInterval(() => {
      setUserCount(prev => {
        const change = Math.floor(Math.random() * 10) - 5;
        return Math.max(1, prev + change);
      });
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Badge variant="outline" className="flex items-center space-x-1">
      <Users className="w-3 h-3" />
      <span className="text-xs">{userCount} online</span>
    </Badge>
  );
};

export default LiveUserCounter;
