
import { useState, useEffect, useCallback, useRef } from 'react';
import { realtimeService, RealtimeEvent, RealtimeEventType } from '@/services/realtime/realtimeService';
import { logger } from '@/services/loggerService';

interface UseRealtimeOptions {
  channel: string;
  eventTypes?: RealtimeEventType[];
  onEvent?: (event: RealtimeEvent) => void;
  enabled?: boolean;
}

export const useRealtime = ({ 
  channel, 
  eventTypes, 
  onEvent, 
  enabled = true 
}: UseRealtimeOptions) => {
  const [events, setEvents] = useState<RealtimeEvent[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<string>('disconnected');
  const subscriptionIdRef = useRef<string | null>(null);

  const handleEvent = useCallback((event: RealtimeEvent) => {
    // Filter by event types if specified
    if (eventTypes && !eventTypes.includes(event.type)) {
      return;
    }

    setEvents(prev => [...prev.slice(-99), event]); // Keep last 100 events
    onEvent?.(event);
    
    logger.debug('Realtime event processed', { 
      channel, 
      eventType: event.type 
    }, 'useRealtime');
  }, [eventTypes, onEvent, channel]);

  const broadcast = useCallback((event: Omit<RealtimeEvent, 'id' | 'timestamp'>) => {
    realtimeService.broadcast(channel, event);
  }, [channel]);

  const clearEvents = useCallback(() => {
    setEvents([]);
  }, []);

  useEffect(() => {
    if (!enabled) return;

    // Subscribe to realtime events
    const subscriptionId = realtimeService.subscribe(channel, handleEvent);
    subscriptionIdRef.current = subscriptionId;

    // Monitor connection status
    const statusInterval = setInterval(() => {
      setConnectionStatus(realtimeService.getConnectionStatus());
    }, 1000);

    return () => {
      if (subscriptionIdRef.current) {
        realtimeService.unsubscribe(subscriptionIdRef.current);
      }
      clearInterval(statusInterval);
    };
  }, [channel, handleEvent, enabled]);

  return {
    events,
    connectionStatus,
    broadcast,
    clearEvents,
    isConnected: connectionStatus === 'connected'
  };
};

// Hook for live business updates
export const useBusinessUpdates = () => {
  return useRealtime({
    channel: 'business-updates',
    eventTypes: ['business_update', 'new_business']
  });
};

// Hook for live reviews
export const useReviewUpdates = (businessId?: string) => {
  const { events, ...rest } = useRealtime({
    channel: 'review-updates',
    eventTypes: ['review_added']
  });

  // Filter events by business ID if provided
  const filteredEvents = businessId 
    ? events.filter(event => event.data?.business_id === businessId)
    : events;

  return {
    events: filteredEvents,
    ...rest
  };
};

// Hook for system notifications
export const useSystemNotifications = () => {
  const [notifications, setNotifications] = useState<RealtimeEvent[]>([]);

  const { events } = useRealtime({
    channel: 'system-notifications',
    eventTypes: ['system_alert', 'user_activity'],
    onEvent: (event) => {
      setNotifications(prev => [...prev.slice(-49), event]); // Keep last 50 notifications
    }
  });

  const dismissNotification = useCallback((notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  return {
    notifications,
    dismissNotification,
    clearAllNotifications,
    hasUnread: notifications.length > 0
  };
};
