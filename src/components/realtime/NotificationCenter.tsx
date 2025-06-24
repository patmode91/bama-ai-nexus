
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useSystemNotifications } from '@/hooks/useRealtime';
import { Bell, X, Check, Settings, Filter } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Notification {
  id: string;
  type: 'business_update' | 'review' | 'event' | 'system' | 'message';
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  actionUrl?: string;
  metadata?: {
    businessId?: string;
    userId?: string;
    avatar?: string;
  };
}

const NotificationCenter = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [showSettings, setShowSettings] = useState(false);
  const { notifications: realtimeNotifications, dismissNotification, clearAllNotifications } = useSystemNotifications();

  useEffect(() => {
    // Initialize with mock notifications
    const mockNotifications: Notification[] = [
      {
        id: '1',
        type: 'business_update',
        title: 'New Business Added',
        message: 'Alabama Tech Solutions has joined the directory',
        timestamp: Date.now() - 300000,
        read: false,
        actionUrl: '/business/1',
        metadata: { businessId: '1' }
      },
      {
        id: '2',
        type: 'review',
        title: 'New Review Received',
        message: 'Your business received a 5-star review',
        timestamp: Date.now() - 600000,
        read: false,
        metadata: { businessId: '2', avatar: undefined }
      },
      {
        id: '3',
        type: 'event',
        title: 'Upcoming Event',
        message: 'Birmingham Business Networking starts in 2 hours',
        timestamp: Date.now() - 900000,
        read: true,
        actionUrl: '/events/networking-2024'
      }
    ];
    setNotifications(mockNotifications);
  }, []);

  useEffect(() => {
    // Process real-time notifications
    realtimeNotifications.forEach(realtimeNotif => {
      const notification: Notification = {
        id: realtimeNotif.id,
        type: realtimeNotif.type as Notification['type'],
        title: realtimeNotif.data?.title || 'System Notification',
        message: realtimeNotif.data?.message || 'New activity detected',
        timestamp: realtimeNotif.timestamp,
        read: false,
        actionUrl: realtimeNotif.data?.actionUrl,
        metadata: realtimeNotif.data?.metadata
      };
      
      setNotifications(prev => [notification, ...prev]);
    });
  }, [realtimeNotifications]);

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  const removeNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
    dismissNotification(notificationId);
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'business_update':
        return '🏢';
      case 'review':
        return '⭐';
      case 'event':
        return '📅';
      case 'message':
        return '💬';
      default:
        return '🔔';
    }
  };

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'business_update':
        return 'border-blue-500/20 bg-blue-500/5';
      case 'review':
        return 'border-yellow-500/20 bg-yellow-500/5';
      case 'event':
        return 'border-green-500/20 bg-green-500/5';
      case 'message':
        return 'border-purple-500/20 bg-purple-500/5';
      default:
        return 'border-gray-500/20 bg-gray-500/5';
    }
  };

  const filteredNotifications = filter === 'all' 
    ? notifications 
    : notifications.filter(notif => notif.type === filter);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <Card className="bg-gray-900/80 backdrop-blur-sm border-gray-700">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Bell className="w-5 h-5" />
            <span>Notifications</span>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="text-xs">
                {unreadCount}
              </Badge>
            )}
          </CardTitle>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
            >
              <Settings className="w-4 h-4" />
            </Button>
            
            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={markAllAsRead}
              >
                <Check className="w-4 h-4 mr-1" />
                Mark All Read
              </Button>
            )}
          </div>
        </div>
        
        {showSettings && (
          <div className="flex space-x-2 mt-3">
            <Filter className="w-4 h-4 mt-1" />
            {['all', 'business_update', 'review', 'event', 'message'].map((filterType) => (
              <Button
                key={filterType}
                variant={filter === filterType ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter(filterType)}
                className="text-xs"
              >
                {filterType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </Button>
            ))}
          </div>
        )}
      </CardHeader>
      
      <CardContent>
        <ScrollArea className="h-[500px]">
          <div className="space-y-2">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-3 rounded-lg border transition-colors ${
                  notification.read 
                    ? 'bg-gray-800/50 border-gray-600' 
                    : `${getNotificationColor(notification.type)} border-l-4`
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className="text-lg flex-shrink-0">
                      {getNotificationIcon(notification.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className={`font-medium text-sm ${
                          notification.read ? 'text-gray-300' : 'text-white'
                        }`}>
                          {notification.title}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {notification.type.replace('_', ' ')}
                        </Badge>
                      </div>
                      
                      <p className={`text-sm mb-2 ${
                        notification.read ? 'text-gray-400' : 'text-gray-300'
                      }`}>
                        {notification.message}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                        </span>
                        
                        {notification.actionUrl && (
                          <Button variant="link" size="sm" className="text-xs p-0 h-auto">
                            View Details
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-1 ml-2">
                    {!notification.read && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => markAsRead(notification.id)}
                        className="p-1 h-auto"
                      >
                        <Check className="w-3 h-3" />
                      </Button>
                    )}
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeNotification(notification.id)}
                      className="p-1 h-auto text-gray-400 hover:text-red-400"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            
            {filteredNotifications.length === 0 && (
              <div className="text-center text-gray-400 py-8">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No notifications for this filter</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default NotificationCenter;
