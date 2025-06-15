
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { Users, Eye, Search, MessageSquare, Star, Calendar } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface UserActivity {
  id: string;
  user_id: string;
  user_name: string;
  user_avatar?: string;
  activity_type: 'view' | 'search' | 'message' | 'review' | 'event' | 'connection';
  target: string;
  details?: string;
  timestamp: string;
  location?: string;
}

interface OnlineUser {
  id: string;
  name: string;
  avatar?: string;
  status: 'online' | 'away' | 'busy';
  current_page?: string;
  last_seen: string;
}

const LiveUserTracker = () => {
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);

  useEffect(() => {
    loadUserData();
    subscribeToUserActivity();
    trackPresence();
  }, []);

  const loadUserData = async () => {
    // Mock data for demonstration
    const mockActivities: UserActivity[] = [
      {
        id: '1',
        user_id: 'user1',
        user_name: 'Sarah Johnson',
        activity_type: 'search',
        target: 'Tech companies in Birmingham',
        timestamp: new Date(Date.now() - 120000).toISOString(),
        location: 'Birmingham'
      },
      {
        id: '2',
        user_id: 'user2',
        user_name: 'Mike Davis',
        activity_type: 'view',
        target: 'Alabama Tech Solutions',
        details: 'Business profile',
        timestamp: new Date(Date.now() - 180000).toISOString(),
        location: 'Mobile'
      },
      {
        id: '3',
        user_id: 'user3',
        user_name: 'Emily Rodriguez',
        activity_type: 'review',
        target: 'Southern Comfort Catering',
        details: '5-star review',
        timestamp: new Date(Date.now() - 240000).toISOString(),
        location: 'Huntsville'
      }
    ];

    const mockOnlineUsers: OnlineUser[] = [
      {
        id: 'user1',
        name: 'Sarah Johnson',
        status: 'online',
        current_page: 'AI Search',
        last_seen: new Date().toISOString()
      },
      {
        id: 'user2',
        name: 'Mike Davis',
        status: 'online',
        current_page: 'Business Directory',
        last_seen: new Date(Date.now() - 60000).toISOString()
      },
      {
        id: 'user3',
        name: 'Emily Rodriguez',
        status: 'away',
        current_page: 'Dashboard',
        last_seen: new Date(Date.now() - 300000).toISOString()
      }
    ];

    setActivities(mockActivities);
    setOnlineUsers(mockOnlineUsers);
    setTotalUsers(234);
  };

  const subscribeToUserActivity = () => {
    const channel = supabase
      .channel('user_activity')
      .on('broadcast', { event: 'user_action' }, (payload) => {
        const newActivity = payload.payload as UserActivity;
        setActivities(prev => [newActivity, ...prev.slice(0, 49)]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const trackPresence = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const channel = supabase
      .channel('user_presence')
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const users: OnlineUser[] = [];
        
        Object.entries(state).forEach(([key, presence]) => {
          if (Array.isArray(presence) && presence.length > 0) {
            const presenceData = presence[0] as any;
            users.push({
              id: presenceData.user_id || key,
              name: presenceData.user_name || 'Anonymous',
              avatar: presenceData.user_avatar,
              status: presenceData.status || 'online',
              current_page: presenceData.current_page,
              last_seen: presenceData.last_seen || new Date().toISOString()
            });
          }
        });
        
        setOnlineUsers(users);
      })
      .subscribe();

    await channel.track({
      user_id: user.id,
      user_name: user.user_metadata?.full_name || 'Anonymous',
      user_avatar: user.user_metadata?.avatar_url,
      status: 'online',
      current_page: window.location.pathname,
      last_seen: new Date().toISOString()
    });
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'view':
        return <Eye className="w-4 h-4 text-blue-500" />;
      case 'search':
        return <Search className="w-4 h-4 text-green-500" />;
      case 'message':
        return <MessageSquare className="w-4 h-4 text-purple-500" />;
      case 'review':
        return <Star className="w-4 h-4 text-yellow-500" />;
      case 'event':
        return <Calendar className="w-4 h-4 text-red-500" />;
      default:
        return <Users className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-500';
      case 'away':
        return 'bg-yellow-500';
      case 'busy':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Online Users */}
      <Card className="bg-gray-900/80 backdrop-blur-sm border-gray-700">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2">
            <Users className="w-5 h-5" />
            <span>Online Users ({onlineUsers.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px]">
            <div className="space-y-3">
              {onlineUsers.map((user) => (
                <div key={user.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-800/50">
                  <div className="relative">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-gray-900 ${getStatusColor(user.status)}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-white text-sm">{user.name}</div>
                    <div className="text-xs text-gray-400">
                      {user.current_page && `On ${user.current_page}`}
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs capitalize">
                    {user.status}
                  </Badge>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Live Activity Stream */}
      <Card className="bg-gray-900/80 backdrop-blur-sm border-gray-700">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2">
            <Eye className="w-5 h-5" />
            <span>Live Activity Stream</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px]">
            <div className="space-y-3">
              {activities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3 p-2 rounded-lg hover:bg-gray-800/50">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center">
                      {getActivityIcon(activity.activity_type)}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-white">
                      <span className="font-medium text-blue-400">{activity.user_name}</span>
                      <span className="mx-1">
                        {activity.activity_type === 'view' && 'viewed'}
                        {activity.activity_type === 'search' && 'searched for'}
                        {activity.activity_type === 'message' && 'sent a message about'}
                        {activity.activity_type === 'review' && 'reviewed'}
                        {activity.activity_type === 'event' && 'joined event'}
                      </span>
                      <span className="font-medium">{activity.target}</span>
                    </div>
                    {activity.details && (
                      <div className="text-xs text-gray-400 mt-1">{activity.details}</div>
                    )}
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                      </span>
                      {activity.location && (
                        <>
                          <span className="text-gray-500">•</span>
                          <span className="text-xs text-gray-400">{activity.location}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default LiveUserTracker;
