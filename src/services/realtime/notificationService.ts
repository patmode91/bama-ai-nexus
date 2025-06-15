
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { toast } from 'sonner';

type Notification = Database['public']['Tables']['notifications']['Row'];
type NotificationInsert = Database['public']['Tables']['notifications']['Insert'];

export interface NotificationSubscription {
  unsubscribe: () => void;
}

class NotificationService {
  private channels: Map<string, any> = new Map();

  async getUserNotifications(userId: string, limit: number = 50): Promise<Notification[]> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  }

  async getUnreadCount(userId: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_read', false);

      if (error) throw error;
      return count || 0;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      return 0;
    }
  }

  async markAsRead(notificationId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) throw error;
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }

  async markAllAsRead(userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', userId)
        .eq('is_read', false);

      if (error) throw error;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  }

  async createNotification(notification: NotificationInsert): Promise<void> {
    try {
      const { error } = await supabase
        .from('notifications')
        .insert(notification);

      if (error) throw error;
    } catch (error) {
      console.error('Error creating notification:', error);
    }
  }

  subscribeToNotifications(
    userId: string,
    onNotification: (notification: Notification) => void
  ): NotificationSubscription {
    const channelName = `notifications_${userId}`;
    
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          const notification = payload.new as Notification;
          onNotification(notification);
          
          // Show toast notification
          this.showToastNotification(notification);
        }
      )
      .subscribe();

    this.channels.set(channelName, channel);

    return {
      unsubscribe: () => {
        supabase.removeChannel(channel);
        this.channels.delete(channelName);
      }
    };
  }

  private showToastNotification(notification: Notification) {
    const toastOptions = {
      description: notification.message,
      action: notification.action_url ? {
        label: 'View',
        onClick: () => {
          if (notification.action_url) {
            window.location.href = notification.action_url;
          }
        }
      } : undefined
    };

    switch (notification.type) {
      case 'like':
      case 'comment':
        toast.success(notification.title, toastOptions);
        break;
      case 'event':
        toast.info(notification.title, toastOptions);
        break;
      case 'system':
        toast.warning(notification.title, toastOptions);
        break;
      default:
        toast(notification.title, toastOptions);
    }
  }

  async sendBusinessUpdateNotification(
    businessId: number,
    updateType: string,
    title: string,
    description?: string
  ): Promise<void> {
    try {
      // Get business followers or interested users
      // For now, we'll send to all authenticated users as an example
      const notification: NotificationInsert = {
        user_id: '', // This would be set per user in a real implementation
        type: 'business_update',
        title,
        message: description || `New update for business ${businessId}`,
        target_id: businessId.toString(),
        action_url: `/business/${businessId}`,
        metadata: { businessId, updateType }
      };

      // In a real implementation, you'd loop through followers
      await this.createNotification(notification);
    } catch (error) {
      console.error('Error sending business update notification:', error);
    }
  }

  cleanup(): void {
    this.channels.forEach(channel => {
      supabase.removeChannel(channel);
    });
    this.channels.clear();
  }
}

export const notificationService = new NotificationService();
