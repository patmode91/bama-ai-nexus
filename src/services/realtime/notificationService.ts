import { supabase } from '@/integrations/supabase/client'; // Adjust path as per your project structure
import type { RealtimeChannel, PostgrestSingleResponse, PostgrestResponse } from '@supabase/supabase-js';

// --- TypeScript Interfaces and Types ---

export const NotificationTypes = [
  'like', 'comment', 'follow', 'mention', 'event',
  'business_update', 'system', 'chat_message'
] as const;

export type NotificationType = typeof NotificationTypes[number];

export interface Notification {
  id: string; // UUID
  user_id: string; // UUID of the recipient user
  type: NotificationType;
  title: string;
  message: string;
  from_user_id?: string | null; // UUID of the user who triggered the notification (optional)
  target_id?: string | null; // UUID of the entity related to the notification (e.g., post ID, comment ID) (optional)
  action_url?: string | null; // URL to navigate to when notification is clicked (optional)
  metadata?: Record<string, any> | null; // For additional data
  is_read: boolean;
  created_at: string; // ISO timestamp string
}

// For creating notifications, some fields are auto-generated or set by default
export type CreateNotificationPayload = Omit<Notification, 'id' | 'created_at' | 'is_read'>;

export class NotificationService {
  private static instance: NotificationService;

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  // --- Notification Creation ---

  /**
   * Creates a new notification.
   * @param notificationData Data for the new notification.
   * @returns The created Notification object or null if an error occurs.
   */
  async createNotification(notificationData: CreateNotificationPayload): Promise<Notification | null> {
    try {
      // Ensure the type is valid before sending to the DB, although DB has a CHECK constraint.
      if (!NotificationTypes.includes(notificationData.type)) {
        throw new Error(`Invalid notification type: ${notificationData.type}`);
      }

      const { data, error }: PostgrestSingleResponse<Notification> = await supabase
        .from('notifications')
        .insert(notificationData) // is_read defaults to false, created_at defaults to now()
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error: any) {
      console.error('Error creating notification:', error.message);
      return null;
    }
  }

  // --- Notification Management ---

  /**
   * Fetches notifications for a specific user.
   * @param userId ID of the user whose notifications to fetch.
   * @param limit Max number of notifications to return. Defaults to 20.
   * @param offset Number of notifications to skip (for pagination). Defaults to 0.
   * @param unreadOnly Whether to fetch only unread notifications. Defaults to false.
   * @returns An array of Notification objects.
   */
  async getUserNotifications(
    userId: string,
    limit: number = 20,
    offset: number = 0,
    unreadOnly: boolean = false
  ): Promise<Notification[]> {
    try {
      let query = supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (unreadOnly) {
        query = query.eq('is_read', false);
      }

      const { data, error }: PostgrestResponse<Notification> = await query;

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      console.error(`Error fetching notifications for user ${userId}:`, error.message);
      return [];
    }
  }

  /**
   * Marks a specific notification as read for a user.
   * RLS policy should ensure user can only mark their own notifications.
   * @param notificationId ID of the notification to mark as read.
   * @param userId ID of the user (for RLS/verification, though RLS primarily handles this).
   * @returns The updated Notification object or null if an error occurs or not found.
   */
  async markNotificationAsRead(notificationId: string, userId: string): Promise<Notification | null> {
    try {
      const { data, error }: PostgrestSingleResponse<Notification> = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId)
        .eq('user_id', userId) // Ensure user owns the notification, complementing RLS.
        .select()
        .single();

      if (error) {
         // PGRST116: "Standard পী জি আর এস টি 116" (JSON object requested, multiple (or no) rows returned)
        if (error.code === 'PGRST116') {
            console.warn(`Notification ${notificationId} not found for user ${userId} or already processed.`);
            return null;
        }
        throw error;
      }
      return data;
    } catch (error: any) {
      console.error(`Error marking notification ${notificationId} as read:`, error.message);
      return null;
    }
  }

  /**
   * Marks all notifications for a user as read.
   * @param userId ID of the user whose notifications to mark as read.
   * @returns True if successful (even if no notifications were updated), false on error.
   */
  async markAllUserNotificationsAsRead(userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', userId)
        .eq('is_read', false); // Only update unread ones

      if (error) throw error;
      // The operation is successful even if 0 rows were updated (e.g., all already read)
      return true;
    } catch (error: any) {
      console.error(`Error marking all notifications as read for user ${userId}:`, error.message);
      return false;
    }
  }

  // --- Real-time Notification Subscription ---

  /**
   * Subscribes to new notifications for a specific user.
   * @param userId The ID of the user to subscribe for.
   * @param onNotificationReceived Callback function that handles new notifications.
   * @returns The Supabase RealtimeChannel object.
   */
  subscribeToUserNotifications(
    userId: string,
    onNotificationReceived: (notification: Notification) => void
  ): RealtimeChannel {
    const channel = supabase
      .channel(`user-${userId}-notifications`)
      .on<Notification>(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          // Assuming RLS allows the user to select this newly inserted row for themselves.
          // The payload.new should contain the full notification.
          onNotificationReceived(payload.new as Notification);
        }
      )
      .subscribe((status, err) => {
        if (status === 'SUBSCRIBED') {
          console.log(`Subscribed to notifications for user ${userId}`);
        }
        if (status === 'CHANNEL_ERROR') {
          console.error(`Error subscribing to user ${userId} notifications:`, err);
        }
        // Handle other statuses as needed (e.g., TIMED_OUT, CLOSED)
      });

    return channel;
  }
}

// Export a singleton instance
export const notificationService = NotificationService.getInstance();
