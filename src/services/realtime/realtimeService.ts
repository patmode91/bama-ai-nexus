import { supabase } from '@/integrations/supabase/client'; // Adjust path as per your project structure
import type { RealtimeChannel, RealtimePresenceJoinPayload, RealtimePresenceLeavePayload, RealtimePresenceState } from '@supabase/supabase-js';

export interface UserPresenceState {
  user_id: string; // UUID of the user
  username?: string; // Display name
  avatar_url?: string; // URL to user's avatar
  last_seen?: string; // ISO timestamp, updated by track()
  // Add any other relevant state information, e.g., status: 'editing', 'typing...'
  [key: string]: any; // Allow arbitrary other properties
}

export class RealtimeService {
  private static instance: RealtimeService;

  public static getInstance(): RealtimeService {
    if (!RealtimeService.instance) {
      RealtimeService.instance = new RealtimeService();
    }
    return RealtimeService.instance;
  }

  /**
   * Joins a room-specific presence channel, subscribes to it, and tracks the user's presence.
   * @param roomId The ID of the room for which to track presence.
   * @param userProfileToTrack The presence state for the current user to broadcast.
   * @returns The RealtimeChannel object if successfully subscribed and tracking, otherwise null.
   */
  async joinRoomChannel(
    roomId: string,
    userProfileToTrack: UserPresenceState
  ): Promise<RealtimeChannel | null> {
    if (!roomId || !userProfileToTrack || !userProfileToTrack.user_id) {
      console.error('Room ID and user profile (with user_id) are required to join a room channel.');
      return null;
    }

    const channelName = `presence-room-${roomId}`;
    const channel = supabase.channel(channelName, {
      config: {
        presence: {
          key: userProfileToTrack.user_id, // Unique key for this client's presence
        },
      },
    });

    try {
      await new Promise<void>((resolve, reject) => { // Changed to Promise<void> as channel is returned outside
        channel
          .on('presence', { event: 'sync' }, () => {
            // This event is triggered when the client first connects and gets the current presence state.
            // console.log(`Presence synced for room ${roomId}`, channel.presenceState());
          })
          .subscribe(async (status, err) => { // Added err parameter for detailed error logging
            if (status === 'SUBSCRIBED') {
              console.log(`Successfully subscribed to presence channel: ${channelName}`);
              const trackStatus = await channel.track(userProfileToTrack);
              if (trackStatus === 'ok') {
                console.log(`User presence tracked for ${userProfileToTrack.user_id} in ${channelName}`);
                resolve();
              } else {
                console.error(`Failed to track presence for ${userProfileToTrack.user_id} in ${channelName}:`, trackStatus);
                // Attempt to unsubscribe and remove channel before rejecting
                await this.cleanupChannel(channel, `Track failure: ${trackStatus}`);
                reject(new Error('Failed to track presence.'));
              }
            } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
              const errorDetails = err ? `Error: ${err.message}` : `Status: ${status}`;
              console.error(`Subscription error on channel ${channelName}: ${errorDetails}`);
              await this.cleanupChannel(channel, `Subscription failure: ${errorDetails}`);
              reject(new Error(`Subscription failed with status: ${status}. ${err ? err.message : ''}`));
            }
          });
      });
      return channel;
    } catch (error: any) {
      console.error(`Error joining room channel ${channelName}:`, error.message);
      // Ensure channel is cleaned up if it exists and an error occurred during the process
      await this.cleanupChannel(channel, `Join room error: ${error.message}`);
      return null;
    }
  }

  /**
   * Private helper to attempt to unsubscribe and remove a channel, logging errors.
   */
  private async cleanupChannel(channel: RealtimeChannel | null, contextMessage: string = "Cleaning up channel") {
    if (!channel) return;
    console.warn(`${contextMessage} - attempting to clean up channel ${channel.topic}`);
    try {
      await channel.unsubscribe();
    } catch (e: any) {
      console.error(`Error during unsubscribe for ${channel.topic}: ${e.message}`);
    }
    try {
      await supabase.removeChannel(channel);
    } catch (e: any) {
      console.error(`Error during removeChannel for ${channel.topic}: ${e.message}`);
    }
  }


  /**
   * Subscribes to presence updates (sync, join, leave) on a given channel.
   * @param channel The RealtimeChannel to listen on.
   * @param onSync Callback triggered on initial connection, receives the full presence state.
   * @param onJoin Callback triggered when a new user joins, receives their ID (key) and presence state.
   * @param onLeave Callback triggered when a user leaves, receives their ID (key) and the presence state they had.
   */
  subscribeToRoomPresenceUpdates(
    channel: RealtimeChannel,
    onSync: (currentState: RealtimePresenceState<UserPresenceState>) => void,
    onJoin: (presenceKey: string, newPresence: UserPresenceState) => void,
    onLeave: (presenceKey: string, leftPresence: UserPresenceState) => void
  ): void {
    channel.on('presence', { event: 'sync' }, () => {
      const currentState = channel.presenceState<UserPresenceState>();
      onSync(currentState);
    });
    channel.on('presence', { event: 'join' }, (payload: RealtimePresenceJoinPayload<UserPresenceState>) => {
      // Supabase Realtime: newPresences is an array. The 'key' in payload refers to the key of the client *that triggered this event*,
      // not necessarily the key of the user who joined if multiple join events are batched.
      // It's generally better to iterate through newPresences and use the key from within each presence state if available,
      // or the 'key' property on the RealtimePresence instance itself.
      // For this UserPresenceState, 'key' is user_id.
      payload.newPresences.forEach(p => onJoin(p.user_id, p));
    });
    channel.on('presence', { event: 'leave' }, (payload: RealtimePresenceLeavePayload<UserPresenceState>) => {
      payload.leftPresences.forEach(p => onLeave(p.user_id, p));
    });
    // Note: The subscribe call is typically done once when setting up the channel (e.g. in joinRoomChannel).
    // This function just attaches handlers. If the channel isn't subscribed, these won't fire.
  }

  /**
   * Untracks user presence, unsubscribes from the channel, and removes it from Supabase client.
   * @param channel The RealtimeChannel to leave.
   */
  async leaveRoomChannel(channel: RealtimeChannel | null): Promise<void> {
    if (!channel) {
      console.warn("leaveRoomChannel called with null channel.");
      return;
    }

    try {
      const untrackStatus = await channel.untrack();
      if (untrackStatus === 'ok') {
        console.log(`Successfully untracked presence from channel: ${channel.topic}`);
      } else {
        console.warn(`Failed to untrack presence from channel ${channel.topic}: ${untrackStatus}`);
      }
    } catch (error: any) {
      console.error(`Error untracking presence from channel ${channel.topic}:`, error.message);
    }
    // Proceed with unsubscribe and remove regardless of untrack status for cleanup.
    await this.cleanupChannel(channel, `Leaving room channel ${channel.topic}`);
  }

  /**
   * Retrieves the current presence state for a channel.
   * Note: This is a synchronous call and reflects the client's last known state.
   * For real-time updates, use subscribeToRoomPresenceUpdates and rely on the 'sync' event.
   * @param channel The RealtimeChannel.
   * @returns The current presence state. Returns an empty object if channel is null.
   */
  getRoomPresenceState(channel: RealtimeChannel | null): RealtimePresenceState<UserPresenceState> {
    if (!channel) return {};
    return channel.presenceState<UserPresenceState>();
  }
}

// Export a singleton instance
export const realtimeService = RealtimeService.getInstance();
