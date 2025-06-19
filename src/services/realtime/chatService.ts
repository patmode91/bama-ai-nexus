import { supabase } from '@/integrations/supabase/client'; // Adjust path as per your project structure
import type { RealtimeChannel, PostgrestSingleResponse } from '@supabase/supabase-js';

// --- TypeScript Interfaces based on DB Schema ---

export interface ChatRoom {
  id: string; // UUID
  name: string;
  description?: string | null;
  created_by: string; // UUID of user from profiles table
  created_at: string; // ISO timestamp string
  is_private: boolean;
  // last_message_at?: string; // Optional, could be updated by a trigger or function
}

export interface ChatParticipant {
  id: string; // UUID
  room_id: string; // UUID
  user_id: string; // UUID from profiles table
  joined_at: string; // ISO timestamp string
  // profile?: PublicUserProfile; // Optional: for joining user profile data
}

// A slimmed-down user profile for display in participant lists or messages
// export interface PublicUserProfile {
//   id: string;
//   username?: string;
//   avatar_url?: string;
// }

export interface ChatMessage {
  id: string; // UUID
  room_id: string; // UUID
  user_id: string; // UUID from profiles table
  content: string;
  message_type: string; // e.g., 'text', 'image_url', 'system_notification'
  metadata?: Record<string, any> | null;
  created_at: string; // ISO timestamp string
  // profile?: PublicUserProfile; // Optional: for joining user profile data
}

export class ChatService {
  private static instance: ChatService;

  public static getInstance(): ChatService {
    if (!ChatService.instance) {
      ChatService.instance = new ChatService();
    }
    return ChatService.instance;
  }

  // --- Room Management ---

  /**
   * Creates a new chat room.
   * If the room is private, the creator is automatically added as a participant.
   * @param name Name of the room.
   * @param userId ID of the user creating the room.
   * @param description Optional description for the room.
   * @param isPrivate Whether the room is private or public. Defaults to false (public).
   * @returns The created ChatRoom object or null if an error occurs.
   */
  async createRoom(
    name: string,
    userId: string,
    description?: string,
    isPrivate: boolean = false
  ): Promise<ChatRoom | null> {
    try {
      const { data, error }: PostgrestSingleResponse<ChatRoom> = await supabase
        .from('chat_rooms')
        .insert({
          name,
          description,
          created_by: userId,
          is_private: isPrivate,
        })
        .select()
        .single();

      if (error) throw error;
      if (!data) return null;

      // If private, or if we decide creators always join, add creator as participant.
      // RLS for chat_participants allows users to add themselves to public rooms.
      // For private rooms, this step ensures the creator is a member.
      // If RLS on chat_participants INSERT didn't allow self-insert for private rooms based on room.created_by,
      // this would need to be a .rpc() call to a privileged function or handled by a DB trigger.
      // Assuming RLS allows creator to join their own private room, or it's public.
      if (data) { // data is the created room
        const participant = await this.joinRoom(data.id, userId);
        if (!participant && isPrivate) { // If failed to join a private room they just created
          console.warn(`User ${userId} failed to auto-join private room ${data.id} they created. This might be an RLS issue.`);
          // Optionally delete the room or handle this case as critical
        }
      }
      return data;
    } catch (error: any) {
      console.error('Error creating room:', error.message);
      return null;
    }
  }

  /**
   * Fetches a single room by its ID.
   * @param roomId The ID of the room to fetch.
   * @returns The ChatRoom object or null if not found or error.
   */
  async getRoom(roomId: string): Promise<ChatRoom | null> {
    try {
      const { data, error }: PostgrestSingleResponse<ChatRoom> = await supabase
        .from('chat_rooms')
        .select('*')
        .eq('id', roomId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // PostgREST "Not Found"
        throw error;
      }
      return data;
    } catch (error: any) {
      console.error('Error fetching room:', error.message);
      return null;
    }
  }

  /**
   * Lists public chat rooms.
   * @param limit Max number of rooms to return.
   * @param offset Number of rooms to skip (for pagination).
   * @returns An array of public ChatRoom objects.
   */
  async listPublicRooms(limit: number = 20, offset: number = 0): Promise<ChatRoom[]> {
    try {
      const { data, error } = await supabase
        .from('chat_rooms')
        .select('*')
        .eq('is_private', false)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      console.error('Error listing public rooms:', error.message);
      return [];
    }
  }

  /**
   * Lists rooms a specific user is a participant of.
   * @param userId The ID of the user.
   * @param limit Max number of rooms to return.
   * @param offset Number of rooms to skip.
   * @returns An array of ChatRoom objects.
   */
  async listUserRooms(userId: string, limit: number = 20, offset: number = 0): Promise<ChatRoom[]> {
    try {
      // We need to join chat_participants with chat_rooms
      // RLS on chat_rooms will ensure user can only see rooms they should.
      // RLS on chat_participants ensures user can only see their own participations.
      const { data, error } = await supabase
        .from('chat_participants')
        .select('...chat_rooms(*)') // Select all columns from the related chat_rooms
        .eq('user_id', userId)
        .order('joined_at', { ascending: false }) // Or order by room's last message etc.
        .range(offset, offset + limit - 1);

      if (error) throw error;
      // The result will be like [{ chat_rooms: { id: ..., name: ... } }, ... ]
      // Map it to return an array of ChatRoom objects directly
      return data?.map(p => p.chat_rooms as ChatRoom).filter(room => room !== null) || [];
    } catch (error: any) {
      console.error('Error listing user rooms:', error.message);
      return [];
    }
  }

  // --- Participant Management ---

  /**
   * Adds a user to a chat room.
   * Relies on RLS policies for authorization (e.g., user joining a public room).
   * @param roomId The ID of the room to join.
   * @param userId The ID of the user joining.
   * @returns The ChatParticipant object or null if an error occurs.
   */
  async joinRoom(roomId: string, userId: string): Promise<ChatParticipant | null> {
    try {
      const { data, error }: PostgrestSingleResponse<ChatParticipant> = await supabase
        .from('chat_participants')
        .insert({ room_id: roomId, user_id: userId })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error: any) {
      // Handle unique constraint violation gracefully (user already in room)
      if (error.code === '23505') { // PostgreSQL unique_violation
        console.log(`User ${userId} is already a participant in room ${roomId}. Fetching existing participation.`);
        const existing = await this.getParticipant(roomId, userId);
        return existing;
      }
      console.error(`Error joining room ${roomId} for user ${userId}:`, error.message);
      return null;
    }
  }

  /**
   * Helper to get a specific participant record.
   */
  async getParticipant(roomId: string, userId: string): Promise<ChatParticipant | null> {
    try {
      const { data, error }: PostgrestSingleResponse<ChatParticipant> = await supabase
        .from('chat_participants')
        .select('*')
        .eq('room_id', roomId)
        .eq('user_id', userId)
        .single();
      if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "Not Found"
      return data;
    } catch (error: any) {
      console.error('Error fetching participant:', error.message);
      return null;
    }
  }


  /**
   * Removes a user from a chat room.
   * Relies on RLS policies for authorization (user leaving a room or admin removing).
   * @param roomId The ID of the room.
   * @param userId The ID of the user to remove.
   * @returns True if successful, false otherwise.
   */
  async leaveRoom(roomId: string, userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('chat_participants')
        .delete()
        .eq('room_id', roomId)
        .eq('user_id', userId);

      if (error) throw error;
      return true;
    } catch (error: any) {
      console.error(`Error leaving room ${roomId} for user ${userId}:`, error.message);
      return false;
    }
  }

  /**
   * Fetches all participants for a given room.
   * Assumes RLS policies allow the requesting user to see participants.
   * @param roomId The ID of the room.
   * @returns An array of ChatParticipant objects (could be enriched with profile data).
   */
  async getRoomParticipants(roomId: string): Promise<ChatParticipant[]> {
    try {
      // To include user profile data, assuming 'profiles' table has 'id', 'username', 'avatar_url'
      // const { data, error } = await supabase
      //   .from('chat_participants')
      //   .select('*, profiles(id, username, avatar_url)')
      //   .eq('room_id', roomId);
      const { data, error } = await supabase
        .from('chat_participants')
        .select('id, room_id, user_id, joined_at') // Specify fields to avoid fetching large profiles if not needed initially
        .eq('room_id', roomId);

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      console.error(`Error fetching participants for room ${roomId}:`, error.message);
      return [];
    }
  }

  // --- Message Management ---

  /**
   * Sends a message to a chat room.
   * @param roomId ID of the room.
   * @param userId ID of the sending user.
   * @param content Content of the message.
   * @param messageType Type of message (e.g., 'text', 'image_url'). Defaults to 'text'.
   * @param metadata Optional JSON metadata for the message.
   * @returns The sent ChatMessage object or null if an error occurs.
   */
  async sendMessage(
    roomId: string,
    userId: string,
    content: string,
    messageType: string = 'text',
    metadata?: Record<string, any>
  ): Promise<ChatMessage | null> {
    try {
      const { data, error }: PostgrestSingleResponse<ChatMessage> = await supabase
        .from('chat_messages')
        .insert({
          room_id: roomId,
          user_id: userId,
          content,
          message_type: messageType,
          metadata,
        })
        .select() // Consider selecting '*, profiles(username, avatar_url)' if needed immediately
        .single();

      if (error) throw error;
      return data;
    } catch (error: any) {
      console.error(`Error sending message to room ${roomId}:`, error.message);
      return null;
    }
  }

  /**
   * Fetches messages for a room, with pagination.
   * @param roomId ID of the room.
   * @param limit Max number of messages to return. Defaults to 50.
   * @param beforeTimestamp Optional ISO timestamp string to fetch messages created before this time (for pagination).
   * @returns An array of ChatMessage objects.
   */
  async getMessages(
    roomId: string,
    limit: number = 50,
    beforeTimestamp?: string
  ): Promise<ChatMessage[]> {
    try {
      let query = supabase
        .from('chat_messages')
        // .select('*, profiles(id, username, avatar_url)') // Example of joining profile data
        .select('*')
        .eq('room_id', roomId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (beforeTimestamp) {
        query = query.lt('created_at', beforeTimestamp);
      }

      const { data, error } = await query;

      if (error) throw error;
      return (data || []).reverse(); // Reverse to have oldest first in the returned batch
    } catch (error: any) {
      console.error(`Error fetching messages for room ${roomId}:`, error.message);
      return [];
    }
  }

  // --- Real-time Subscriptions ---

  /**
   * Subscribes to new messages in a specific chat room.
   * @param roomId The ID of the room to subscribe to.
   * @param onMessageReceived Callback function that handles new messages.
   * @returns The Supabase RealtimeChannel object.
   */
  subscribeToRoomMessages(
    roomId: string,
    onMessageReceived: (message: ChatMessage) => void
  ): RealtimeChannel {
    const channel = supabase
      .channel(`room-${roomId}-messages`)
      .on<ChatMessage>(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          // Here, you might want to fetch the full message with user profile
          // if the payload.new doesn't contain it and RLS allows.
          // For simplicity, returning payload.new directly.
          // Consider if payload.new is sufficient or if a fetch is needed.
          // const newMessage = await this.getMessageById(payload.new.id); -> requires getMessageById
          // if (newMessage) onMessageReceived(newMessage);
          onMessageReceived(payload.new as ChatMessage);
        }
      )
      .subscribe((status, err) => {
        if (status === 'SUBSCRIBED') {
          console.log(`Subscribed to messages in room ${roomId}`);
        }
        if (status === 'CHANNEL_ERROR') {
          console.error(`Error subscribing to room ${roomId} messages:`, err);
        }
      });

    return channel;
  }

  // Placeholder for optional methods
  async updateRoomDetails(roomId: string, updates: Partial<Pick<ChatRoom, 'name' | 'description'>>): Promise<ChatRoom | null> {
    console.warn("updateRoomDetails not fully implemented yet. Requires RLS for owners/admins.");
    try {
        const { data, error } = await supabase
            .from('chat_rooms')
            .update(updates)
            .eq('id', roomId)
            .select()
            .single();
        if (error) throw error;
        return data;
    } catch(error: any) {
        console.error("Error updating room details:", error.message);
        return null;
    }
  }

  async deleteRoom(roomId: string): Promise<boolean> {
    console.warn("deleteRoom not fully implemented yet. Requires RLS for owners/admins and cascading deletes or cleanup.");
    try {
        const { error } = await supabase.from('chat_rooms').delete().eq('id', roomId);
        if (error) throw error;
        return true;
    } catch(error: any) {
        console.error("Error deleting room:", error.message);
        return false;
    }
  }

  async deleteMessage(messageId: string /*, userId: string */): Promise<boolean> {
    console.warn("deleteMessage not fully implemented yet. Requires RLS for message owner/room admin.");
     try {
        const { error } = await supabase.from('chat_messages').delete().eq('id', messageId);
        if (error) throw error;
        return true;
    } catch(error: any) {
        console.error("Error deleting message:", error.message);
        return false;
    }
  }

  async editMessage(messageId: string, /* userId: string, */ newContent: string): Promise<ChatMessage | null> {
    console.warn("editMessage not fully implemented yet. Requires RLS for message owner.");
    try {
        const { data, error } = await supabase
            .from('chat_messages')
            .update({ content: newContent, /* updated_at: new Date() */ })
            .eq('id', messageId)
            .select()
            .single();
        if (error) throw error;
        return data;
    } catch(error: any) {
        console.error("Error editing message:", error.message);
        return null;
    }
  }
}

// Export a singleton instance
export const chatService = ChatService.getInstance();
