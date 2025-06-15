
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';
import { logger } from '../loggerService';

export type RealtimeEventType = 
  | 'business_update' 
  | 'new_business' 
  | 'review_added'
  | 'user_activity'
  | 'system_alert'
  | 'chat_message'
  | 'broadcast'; // Added broadcast as a valid type

export interface RealtimeEvent {
  id: string;
  type: RealtimeEventType;
  data: any;
  timestamp: number;
  userId?: string;
  metadata?: Record<string, any>;
}

export interface RealtimeSubscription {
  id: string;
  channel: string;
  callback: (event: RealtimeEvent) => void;
  isActive: boolean;
}

class RealtimeService {
  private channels = new Map<string, RealtimeChannel>();
  private subscriptions = new Map<string, RealtimeSubscription>();
  private connectionStatus: 'connected' | 'disconnected' | 'connecting' = 'disconnected';
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  constructor() {
    this.initializeConnection();
  }

  private initializeConnection() {
    this.connectionStatus = 'connecting';
    
    // Monitor connection status through channel subscription status
    // The modern Supabase client doesn't expose onMessage/onError directly
    setTimeout(() => {
      this.connectionStatus = 'connected';
      this.reconnectAttempts = 0;
      logger.info('Realtime connection established', {}, 'RealtimeService');
    }, 1000);
  }

  private handleReconnection() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = Math.pow(2, this.reconnectAttempts) * 1000; // Exponential backoff
      
      setTimeout(() => {
        logger.info(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`, {}, 'RealtimeService');
        this.initializeConnection();
      }, delay);
    }
  }

  subscribe(channelName: string, callback: (event: RealtimeEvent) => void): string {
    const subscriptionId = `${channelName}_${Date.now()}_${Math.random()}`;
    
    // Create or get existing channel
    let channel = this.channels.get(channelName);
    if (!channel) {
      channel = supabase.channel(channelName);
      this.channels.set(channelName, channel);
    }

    // Set up broadcast listener
    channel.on('broadcast', { event: 'realtime_event' }, (payload) => {
      const event: RealtimeEvent = {
        id: payload.id || `event_${Date.now()}`,
        type: payload.type,
        data: payload.data,
        timestamp: payload.timestamp || Date.now(),
        userId: payload.userId,
        metadata: payload.metadata
      };
      
      callback(event);
      logger.debug('Realtime event received', { event }, 'RealtimeService');
    });

    // Set up database changes listener
    channel.on('postgres_changes', 
      { event: '*', schema: 'public' }, 
      (payload) => {
        const event: RealtimeEvent = {
          id: `db_${Date.now()}`,
          type: this.mapDatabaseEventType(payload.table, payload.eventType),
          data: payload.new || payload.old,
          timestamp: Date.now(),
          metadata: { 
            table: payload.table, 
            eventType: payload.eventType,
            old: payload.old 
          }
        };
        
        callback(event);
      }
    );

    // Subscribe to channel
    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        this.connectionStatus = 'connected';
        logger.info(`Subscribed to channel: ${channelName}`, {}, 'RealtimeService');
      } else if (status === 'CLOSED') {
        this.connectionStatus = 'disconnected';
        this.handleReconnection();
      }
    });

    // Store subscription
    const subscription: RealtimeSubscription = {
      id: subscriptionId,
      channel: channelName,
      callback,
      isActive: true
    };
    this.subscriptions.set(subscriptionId, subscription);

    return subscriptionId;
  }

  unsubscribe(subscriptionId: string): void {
    const subscription = this.subscriptions.get(subscriptionId);
    if (subscription) {
      subscription.isActive = false;
      this.subscriptions.delete(subscriptionId);
      
      // Check if channel has other active subscriptions
      const hasActiveSubscriptions = Array.from(this.subscriptions.values())
        .some(sub => sub.channel === subscription.channel && sub.isActive);
      
      if (!hasActiveSubscriptions) {
        const channel = this.channels.get(subscription.channel);
        if (channel) {
          channel.unsubscribe();
          this.channels.delete(subscription.channel);
          logger.info(`Unsubscribed from channel: ${subscription.channel}`, {}, 'RealtimeService');
        }
      }
    }
  }

  broadcast(channelName: string, event: Omit<RealtimeEvent, 'id' | 'timestamp'>): void {
    const channel = this.channels.get(channelName);
    if (channel) {
      const fullEvent: RealtimeEvent = {
        ...event,
        id: `broadcast_${Date.now()}_${Math.random()}`,
        timestamp: Date.now()
      };

      channel.send({
        type: 'broadcast',
        event: 'realtime_event',
        payload: fullEvent
      });

      logger.debug('Event broadcasted', { channelName, event: fullEvent }, 'RealtimeService');
    }
  }

  private mapDatabaseEventType(table: string, eventType: string): RealtimeEventType {
    switch (table) {
      case 'businesses':
        return eventType === 'INSERT' ? 'new_business' : 'business_update';
      case 'reviews':
        return 'review_added';
      case 'chat_messages':
        return 'chat_message';
      default:
        return 'system_alert';
    }
  }

  getConnectionStatus(): string {
    return this.connectionStatus;
  }

  getActiveSubscriptions(): RealtimeSubscription[] {
    return Array.from(this.subscriptions.values()).filter(sub => sub.isActive);
  }

  disconnect(): void {
    // Unsubscribe from all channels
    this.channels.forEach((channel, channelName) => {
      channel.unsubscribe();
      logger.info(`Disconnected from channel: ${channelName}`, {}, 'RealtimeService');
    });

    this.channels.clear();
    this.subscriptions.clear();
    this.connectionStatus = 'disconnected';
  }
}

export const realtimeService = new RealtimeService();

// Auto-cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    realtimeService.disconnect();
  });
}
