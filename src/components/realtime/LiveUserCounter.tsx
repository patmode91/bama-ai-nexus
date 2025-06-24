
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Users } from 'lucide-react';
import { useRealtime } from '@/hooks/useRealtime';

const LiveUserCounter: React.FC = () => {
  const [userCount, setUserCount] = React.useState(42); // Mock initial count
  const { events } = useRealtime({
    channel: 'user-presence',
    eventTypes: ['user_activity']
  });

  React.useEffect(() => {
    // Simulate user count updates
    const interval = setInterval(() => {
      setUserCount(prev => {
        const change = Math.floor(Math.random() * 6) - 3; // -3 to +3
        return Math.max(1, prev + change);
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  React.useEffect(() => {
    // Update count based on real-time events
    events.forEach(event => {
      if (event.type === 'user_activity') {
        setUserCount(event.data?.onlineCount || userCount);
      }
    });
  }, [events, userCount]);

  return (
    <Badge variant="outline" className="flex items-center gap-1 bg-blue-100 text-blue-800 border-blue-200">
      <Users className="h-3 w-3" />
      <span>{userCount} online</span>
    </Badge>
  );
};

export default LiveUserCounter;
