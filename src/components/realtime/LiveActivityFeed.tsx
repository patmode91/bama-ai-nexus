
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { Activity, Users, MessageSquare, Calendar, TrendingUp, MapPin, Star } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ActivityItem {
  id: string;
  type: 'business_join' | 'review_posted' | 'event_created' | 'forum_post' | 'business_update' | 'connection_made';
  user: {
    id: string;
    name: string;
    avatar?: string;
    company?: string;
  };
  title: string;
  description: string;
  metadata?: {
    business_name?: string;
    rating?: number;
    event_name?: string;
    location?: string;
  };
  created_at: string;
  is_featured: boolean;
}

const LiveActivityFeed = () => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [isLive, setIsLive] = useState(true);

  useEffect(() => {
    loadActivities();
    if (isLive) {
      subscribeToActivities();
    }
  }, [isLive]);

  const loadActivities = async () => {
    // Mock activity data for demo
    const mockActivities: ActivityItem[] = [
      {
        id: '1',
        type: 'business_join',
        user: {
          id: 'user1',
          name: 'Sarah Chen',
          avatar: undefined,
          company: 'Tech Innovations AL'
        },
        title: 'New Business Joined',
        description: 'Tech Innovations AL just joined the Alabama Business Directory',
        metadata: {
          business_name: 'Tech Innovations AL'
        },
        created_at: new Date(Date.now() - 300000).toISOString(),
        is_featured: true
      },
      {
        id: '2',
        type: 'review_posted',
        user: {
          id: 'user2',
          name: 'Mike Rodriguez',
          avatar: undefined,
          company: undefined
        },
        title: 'New Review Posted',
        description: 'Left a 5-star review for Birmingham Marketing Solutions',
        metadata: {
          business_name: 'Birmingham Marketing Solutions',
          rating: 5
        },
        created_at: new Date(Date.now() - 600000).toISOString(),
        is_featured: false
      },
      {
        id: '3',
        type: 'event_created',
        user: {
          id: 'user3',
          name: 'Emily Davis',
          avatar: undefined,
          company: 'Alabama Chamber of Commerce'
        },
        title: 'New Event Created',
        description: 'Created "Alabama Tech Networking Mixer" event',
        metadata: {
          event_name: 'Alabama Tech Networking Mixer',
          location: 'Birmingham'
        },
        created_at: new Date(Date.now() - 900000).toISOString(),
        is_featured: true
      },
      {
        id: '4',
        type: 'forum_post',
        user: {
          id: 'user4',
          name: 'David Wilson',
          avatar: undefined,
          company: 'Wilson Construction Co'
        },
        title: 'New Forum Post',
        description: 'Started a discussion about "Best Local Suppliers in Alabama"',
        created_at: new Date(Date.now() - 1200000).toISOString(),
        is_featured: false
      },
      {
        id: '5',
        type: 'connection_made',
        user: {
          id: 'user5',
          name: 'Lisa Thompson',
          avatar: undefined,
          company: 'Creative Solutions LLC'
        },
        title: 'New Connection',
        description: 'Connected with 3 new businesses this week',
        created_at: new Date(Date.now() - 1800000).toISOString(),
        is_featured: false
      }
    ];
    setActivities(mockActivities);
  };

  const subscribeToActivities = () => {
    const channel = supabase
      .channel('activity_feed')
      .on('broadcast', { event: 'new_activity' }, (payload) => {
        const newActivity = payload.payload as ActivityItem;
        setActivities(prev => [newActivity, ...prev.slice(0, 49)]); // Keep latest 50
      })
      .subscribe();
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'business_join':
        return <Users className="w-4 h-4 text-green-500" />;
      case 'review_posted':
        return <Star className="w-4 h-4 text-yellow-500" />;
      case 'event_created':
        return <Calendar className="w-4 h-4 text-purple-500" />;
      case 'forum_post':
        return <MessageSquare className="w-4 h-4 text-blue-500" />;
      case 'business_update':
        return <TrendingUp className="w-4 h-4 text-orange-500" />;
      case 'connection_made':
        return <Users className="w-4 h-4 text-cyan-500" />;
      default:
        return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'business_join':
        return 'border-green-500/20 bg-green-500/5';
      case 'review_posted':
        return 'border-yellow-500/20 bg-yellow-500/5';
      case 'event_created':
        return 'border-purple-500/20 bg-purple-500/5';
      case 'forum_post':
        return 'border-blue-500/20 bg-blue-500/5';
      case 'business_update':
        return 'border-orange-500/20 bg-orange-500/5';
      case 'connection_made':
        return 'border-cyan-500/20 bg-cyan-500/5';
      default:
        return 'border-gray-500/20 bg-gray-500/5';
    }
  };

  const filteredActivities = filter === 'all' 
    ? activities 
    : activities.filter(activity => activity.type === filter);

  return (
    <Card className="bg-gray-900/80 backdrop-blur-sm border-gray-700">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Activity className="w-5 h-5" />
            <span>Live Activity Feed</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsLive(!isLive)}
            >
              {isLive ? 'Live' : 'Paused'}
            </Button>
          </div>
        </div>
        
        {/* Activity Filters */}
        <div className="flex flex-wrap gap-2 mt-4">
          {['all', 'business_join', 'review_posted', 'event_created', 'forum_post', 'connection_made'].map((filterType) => (
            <Button
              key={filterType}
              variant={filter === filterType ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(filterType)}
              className="capitalize text-xs"
            >
              {filterType.replace('_', ' ')}
            </Button>
          ))}
        </div>
      </CardHeader>
      
      <CardContent>
        <ScrollArea className="h-[500px]">
          <div className="space-y-4">
            {filteredActivities.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <Activity className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>No activity yet</p>
              </div>
            ) : (
              filteredActivities.map((activity) => (
                <div
                  key={activity.id}
                  className={`p-4 rounded-lg border transition-all hover:shadow-md ${
                    activity.is_featured 
                      ? 'border-blue-500/30 bg-blue-500/5' 
                      : getActivityColor(activity.type)
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={activity.user.avatar} />
                      <AvatarFallback>
                        {activity.user.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        {getActivityIcon(activity.type)}
                        <h4 className="font-medium text-white text-sm">
                          {activity.title}
                        </h4>
                        {activity.is_featured && (
                          <Badge variant="secondary" className="text-xs">
                            Featured
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-sm text-blue-400">
                          {activity.user.name}
                        </span>
                        {activity.user.company && (
                          <>
                            <span className="text-gray-500">•</span>
                            <span className="text-xs text-gray-400">
                              {activity.user.company}
                            </span>
                          </>
                        )}
                      </div>
                      
                      <p className="text-sm text-gray-300 mb-2">
                        {activity.description}
                      </p>
                      
                      {/* Activity Metadata */}
                      {activity.metadata && (
                        <div className="flex flex-wrap gap-2 mb-2">
                          {activity.metadata.business_name && (
                            <Badge variant="outline" className="text-xs">
                              {activity.metadata.business_name}
                            </Badge>
                          )}
                          {activity.metadata.rating && (
                            <Badge variant="outline" className="text-xs flex items-center space-x-1">
                              <Star className="w-3 h-3 fill-current text-yellow-500" />
                              <span>{activity.metadata.rating}</span>
                            </Badge>
                          )}
                          {activity.metadata.location && (
                            <Badge variant="outline" className="text-xs flex items-center space-x-1">
                              <MapPin className="w-3 h-3" />
                              <span>{activity.metadata.location}</span>
                            </Badge>
                          )}
                        </div>
                      )}
                      
                      <p className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default LiveActivityFeed;
