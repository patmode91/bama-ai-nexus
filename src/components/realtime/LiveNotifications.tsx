
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Bell, BellOff, Check, X, User, MessageSquare, Heart, Calendar, TrendingUp } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Notification {
  id: string;
  type: 'like' | 'comment' | 'follow' | 'mention' | 'event' | 'business_update' | 'system';
  title: string;
  message: string;
  user_id: string;
  from_user?: {
    id: string;
    name: string;
    avatar?: string;
  };
  is_read: boolean;
  created_at: string;
  action_url?: string;
  metadata?: Record<string, any>;
}

const LiveNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isEnabled, setIsEnabled] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadNotifications();
    subscribeToNotifications();
  }, []);

  useEffect(() => {
    const unread = notifications.filter(n => !n.is_read).length;
    setUnreadCount(unread);
  }, [notifications]);

  const loadNotifications = async () => {
    // Mock notifications for demo
    const mockNotifications: Notification[] = [
      {
        id: '1',
        type: 'like',
        title: 'New Like',
        message: 'Sarah Johnson liked your post',
        user_id: 'current_user',
        from_user: { id: 'user1', name: 'Sarah Johnson' },
        is_read: false,
        created_at: new Date(Date.now() - 300000).toISOString(),
        action_url: '/community'
      },
      {
        id: '2',
        type: 'comment',
        title: 'New Comment',
        message: 'Mike Davis commented on your business listing',
        user_id: 'current_user',
        from_user: { id: 'user2', name: 'Mike Davis' },
        is_read: false,
        created_at: new Date(Date.now() - 600000).toISOString(),
        action_url: '/business/123'
      },
      {
        id: '3',
        type: 'event',
        title: 'Event Reminder',
        message: 'Alabama Tech Meetup starts in 1 hour',
        user_id: 'current_user',
        is_read: true,
        created_at: new Date(Date.now() - 3600000).toISOString(),
        action_url: '/events'
      },
      {
        id: '4',
        type: 'business_update',
        title: 'Business Update',
        message: 'Your business verification was approved!',
        user_id: 'current_user',
        is_read: false,
        created_at: new Date(Date.now() - 7200000).toISOString(),
        action_url: '/dashboard'
      }
    ];
    setNotifications(mockNotifications);
  };

  const subscribeToNotifications = () => {
    const channel = supabase
      .channel('notifications')
      .on('broadcast', { event: 'new_notification' }, (payload) => {
        const newNotification = payload.payload as Notification;
        setNotifications(prev => [newNotification, ...prev]);
        
        if (isEnabled) {
          toast({
            title: newNotification.title,
            description: newNotification.message,
          });
        }
      })
      .subscribe();
  };

  const markAsRead = async (notificationId: string) => {
    setNotifications(prev =>
      prev.map(n =>
        n.id === notificationId ? { ...n, is_read: true } : n
      )
    );
  };

  const markAllAsRead = async () => {
    setNotifications(prev =>
      prev.map(n => ({ ...n, is_read: true }))
    );
  };

  const deleteNotification = async (notificationId: string) => {
    setNotifications(prev =>
      prev.filter(n => n.id !== notificationId)
    );
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'like':
        return <Heart className="w-4 h-4 text-red-500" />;
      case 'comment':
        return <MessageSquare className="w-4 h-4 text-blue-500" />;
      case 'follow':
        return <User className="w-4 h-4 text-green-500" />;
      case 'event':
        return <Calendar className="w-4 h-4 text-purple-500" />;
      case 'business_update':
        return <TrendingUp className="w-4 h-4 text-yellow-500" />;
      default:
        return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  const toggleNotifications = () => {
    setIsEnabled(!isEnabled);
    toast({
      title: isEnabled ? "Notifications disabled" : "Notifications enabled",
      description: isEnabled 
        ? "You won't receive live notifications" 
        : "You'll now receive live notifications",
    });
  };

  return (
    <Card className="bg-gray-900/80 backdrop-blur-sm border-gray-700">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <CardTitle className="flex items-center space-x-2">
              <Bell className="w-5 h-5" />
              <span>Notifications</span>
            </CardTitle>
            {unreadCount > 0 && (
              <Badge variant="destructive">{unreadCount}</Badge>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleNotifications}
              className="p-2"
            >
              {isEnabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
            </Button>
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                Mark all read
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <ScrollArea className="h-[400px]">
          <div className="space-y-3">
            {notifications.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <Bell className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>No notifications yet</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 rounded-lg border transition-colors ${
                    notification.is_read
                      ? 'bg-gray-800 border-gray-700'
                      : 'bg-blue-900/20 border-blue-700'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      {notification.from_user ? (
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={notification.from_user.avatar} />
                          <AvatarFallback>
                            {notification.from_user.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                          {getNotificationIcon(notification.type)}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium text-white text-sm">
                          {notification.title}
                        </h4>
                        {!notification.is_read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full" />
                        )}
                      </div>
                      <p className="text-sm text-gray-300 mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                      </p>
                    </div>
                    
                    <div className="flex-shrink-0 flex items-center space-x-1">
                      {!notification.is_read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => markAsRead(notification.id)}
                          className="p-1"
                        >
                          <Check className="w-3 h-3" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteNotification(notification.id)}
                        className="p-1"
                      >
                        <X className="w-3 h-3" />
                      </Button>
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

export default LiveNotifications;
