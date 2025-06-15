
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

type ChatRoom = Database['public']['Tables']['chat_rooms']['Row'];
type ChatMessage = Database['public']['Tables']['chat_messages']['Row'];
type ChatMessageInsert = Database['public']['Tables']['chat_messages']['Insert'];

export interface ChatSubscription {
  unsubscribe: () => void;
}

class ChatService {
  private channels: Map<string, any> = new Map();

  async getChatRooms(): Promise<ChatRoom[]> {
    try {
      const { data, error } = await supabase
        .from('chat_rooms')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching chat rooms:', error);
      return [];
    }
  }

  async getChatMessages(roomId: string, limit: number = 50): Promise<ChatMessage[]> {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('room_id', roomId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return (data || []).reverse(); // Reverse to show oldest first
    } catch (error) {
      console.error('Error fetching chat messages:', error);
      return [];
    }
  }

  async sendMessage(message: ChatMessageInsert): Promise<ChatMessage | null> {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .insert(message)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error sending message:', error);
      return null;
    }
  }

  async createChatRoom(name: string, description?: string, isPrivate: boolean = false): Promise<ChatRoom | null> {
    try {
      const { data, error } = await supabase
        .from('chat_rooms')
        .insert({
          name,
          description,
          is_private: isPrivate
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating chat room:', error);
      return null;
    }
  }

  subscribeToRoom(
    roomId: string,
    onMessage: (message: ChatMessage) => void
  ): ChatSubscription {
    const channelName = `chat_${roomId}`;
    
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `room_id=eq.${roomId}`
        },
        (payload) => {
          const message = payload.new as ChatMessage;
          onMessage(message);
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

  subscribeToPresence(
    roomId: string,
    userProfile: { id: string; name: string; avatar?: string },
    onPresenceChange: (presence: any) => void
  ): ChatSubscription {
    const channelName = `presence_${roomId}`;
    
    const channel = supabase
      .channel(channelName)
      .on('presence', { event: 'sync' }, () => {
        const presenceState = channel.presenceState();
        onPresenceChange(presenceState);
      })
      .on('presence', { event: 'join' }, ({ newPresences }) => {
        console.log('New users joined:', newPresences);
      })
      .on('presence', { event: 'leave' }, ({ leftPresences }) => {
        console.log('Users left:', leftPresences);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            user_id: userProfile.id,
            name: userProfile.name,
            avatar: userProfile.avatar,
            online_at: new Date().toISOString(),
          });
        }
      });

    this.channels.set(channelName, channel);

    return {
      unsubscribe: () => {
        supabase.removeChannel(channel);
        this.channels.delete(channelName);
      }
    };
  }

  cleanup(): void {
    this.channels.forEach(channel => {
      supabase.removeChannel(channel);
    });
    this.channels.clear();
  }
}

export const chatService = new ChatService();
