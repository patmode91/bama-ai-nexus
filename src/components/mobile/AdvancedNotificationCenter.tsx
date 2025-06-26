
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Bell, 
  X, 
  MessageSquare, 
  TrendingUp, 
  Users, 
  Building2,
  Star,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Info,
  Settings,
  Filter
} from 'lucide-react';

interface Notification {
  id: string;
  type: 'message' | 'business' | 'system' | 'event' | 'alert';
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  priority: 'low' | 'medium' | 'high';
  actionUrl?: string;
  actionLabel?: string;
  avatar?: string;
}

interface AdvancedNotificationCenterProps {
  onClose?: () => void;
}

const AdvancedNotificationCenter: React.FC<AdvancedNotificationCenterProps> = ({ onClose }) => {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'business',
      title: 'New Business Listed',
      message: 'Alabama AI Solutions has joined the platform',
      timestamp: Date.now() - 300000,
      read: false,
      priority: 'medium',
      actionUrl: '/business/1',
      actionLabel: 'View Profile'
    },
    {
      id: '2',
      type: 'message',
      title: 'New Message',
      message: 'John from TechHub Birmingham sent you a message',
      timestamp: Date.now() - 900000,
      read: false,
      priority: 'high',
      actionUrl: '/messages',
      actionLabel: 'Reply'
    },
    {
      id: '3',
      type: 'event',
      title: 'Upcoming Event',
      message: 'AI Innovation Summit starts in 2 hours',
      timestamp: Date.now() - 1800000,
      read: true,
      priority: 'high',
      actionUrl: '/events/1',
      actionLabel: 'Join Event'
    },
    {
      id: '4',
      type: 'system',
      title: 'Profile Updated',
      message: 'Your business profile has been successfully verified',
      timestamp: Date.now() - 3600000,
      read: true,
      priority: 'low'
    },
    {
      id: '5',
      type: 'alert',
      title: 'System Maintenance',
      message: 'Scheduled maintenance tonight from 2-4 AM EST',
      timestamp: Date.now() - 7200000,
      read: false,
      priority: 'medium'
    }
  ]);

  const [activeTab, setActiveTab] = useState('all');
  const [filter, setFilter] = useState<'all' | 'unread' | 'priority'>('all');

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'message': return MessageSquare;
      case 'business': return Building2;
      case 'event': return Calendar;
      case 'alert': return AlertTriangle;
      default: return Bell;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-400';
      case 'medium': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'message': return 'bg-blue-600';
      case 'business': return 'bg-green-600';
      case 'event': return 'bg-purple-600';
      case 'alert': return 'bg-red-600';
      default: return 'bg-gray-600';
    }
  };

  const formatTimestamp = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const filteredNotifications = notifications.filter(notif => {
    if (activeTab !== 'all' && notif.type !== activeTab) return false;
    if (filter === 'unread' && notif.read) return false;
    if (filter === 'priority' && notif.priority === 'low') return false;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="fixed inset-0 bg-gray-900/95 backdrop-blur-md z-50 md:hidden">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <h2 className="text-xl font-bold text-white">Notifications</h2>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="bg-red-600">
                {unreadCount}
              </Badge>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="text-gray-300"
            >
              <CheckCircle className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-300"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex space-x-2">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
            >
              All
            </Button>
            <Button
              variant={filter === 'unread' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('unread')}
            >
              Unread ({unreadCount})
            </Button>
            <Button
              variant={filter === 'priority' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('priority')}
            >
              Priority
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="bg-gray-800 border-gray-700 mx-4 mt-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="message">Messages</TabsTrigger>
            <TabsTrigger value="business">Business</TabsTrigger>
            <TabsTrigger value="event">Events</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="flex-1 mt-0">
            <ScrollArea className="h-full p-4">
              {filteredNotifications.length === 0 ? (
                <div className="text-center py-12">
                  <Bell className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-300 mb-2">No notifications</h3>
                  <p className="text-gray-500">You're all caught up!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredNotifications.map((notification) => {
                    const IconComponent = getNotificationIcon(notification.type);
                    return (
                      <Card
                        key={notification.id}
                        className={`bg-gray-800 border-gray-700 cursor-pointer transition-colors ${
                          !notification.read ? 'border-l-4 border-l-blue-500' : ''
                        }`}
                        onClick={() => markAsRead(notification.id)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start space-x-3">
                            <div className={`p-2 rounded-full ${getTypeColor(notification.type)}`}>
                              <IconComponent className="w-4 h-4 text-white" />
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <h4 className={`font-semibold ${notification.read ? 'text-gray-300' : 'text-white'}`}>
                                  {notification.title}
                                </h4>
                                <div className="flex items-center space-x-2">
                                  <span className={`text-xs ${getPriorityColor(notification.priority)}`}>
                                    ●
                                  </span>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      deleteNotification(notification.id);
                                    }}
                                    className="text-gray-500 hover:text-gray-300"
                                  >
                                    <X className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                              
                              <p className={`text-sm mb-2 ${notification.read ? 'text-gray-500' : 'text-gray-300'}`}>
                                {notification.message}
                              </p>
                              
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-500">
                                  {formatTimestamp(notification.timestamp)}
                                </span>
                                
                                {notification.actionLabel && (
                                  <Button size="sm" variant="outline" className="text-xs">
                                    {notification.actionLabel}
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdvancedNotificationCenter;
