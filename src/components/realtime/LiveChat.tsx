
import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Send, Users, Smile } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ChatMessage {
  id: string;
  content: string;
  user_id: string;
  user_name: string;
  user_avatar?: string;
  room_id: string;
  created_at: string;
  message_type: 'text' | 'system' | 'announcement';
}

interface ChatRoom {
  id: string;
  name: string;
  description?: string;
  is_private: boolean;
  member_count: number;
}

const LiveChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [activeRoom, setActiveRoom] = useState<string>('general');
  const [newMessage, setNewMessage] = useState('');
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initializeChat();
    return () => {
      supabase.removeAllChannels();
    };
  }, []);

  useEffect(() => {
    if (activeRoom) {
      loadMessages(activeRoom);
      subscribeToRoom(activeRoom);
    }
  }, [activeRoom]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const initializeChat = async () => {
    // Load available chat rooms
    const mockRooms: ChatRoom[] = [
      { id: 'general', name: 'General Discussion', description: 'Open chat for all members', is_private: false, member_count: 127 },
      { id: 'business', name: 'Business Networking', description: 'Connect with other business owners', is_private: false, member_count: 89 },
      { id: 'tech', name: 'Tech Talk', description: 'Technology discussions', is_private: false, member_count: 156 },
      { id: 'events', name: 'Events & Meetups', description: 'Upcoming events and meetups', is_private: false, member_count: 203 }
    ];
    setRooms(mockRooms);
    setIsConnected(true);
  };

  const loadMessages = async (roomId: string) => {
    // Mock messages for demo
    const mockMessages: ChatMessage[] = [
      {
        id: '1',
        content: 'Welcome to the Alabama Business Directory chat!',
        user_id: 'system',
        user_name: 'System',
        room_id: roomId,
        created_at: new Date(Date.now() - 3600000).toISOString(),
        message_type: 'system'
      },
      {
        id: '2',
        content: 'Hey everyone! Just joined the directory. Excited to connect with fellow Alabama business owners.',
        user_id: 'user1',
        user_name: 'Sarah Johnson',
        room_id: roomId,
        created_at: new Date(Date.now() - 1800000).toISOString(),
        message_type: 'text'
      },
      {
        id: '3',
        content: 'Welcome Sarah! What kind of business do you run?',
        user_id: 'user2',
        user_name: 'Mike Davis',
        room_id: roomId,
        created_at: new Date(Date.now() - 1200000).toISOString(),
        message_type: 'text'
      }
    ];
    setMessages(mockMessages);
  };

  const subscribeToRoom = (roomId: string) => {
    const channel = supabase
      .channel(`chat_room_${roomId}`)
      .on('broadcast', { event: 'new_message' }, (payload) => {
        const newMsg = payload.payload as ChatMessage;
        setMessages(prev => [...prev, newMsg]);
      })
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const users = Object.keys(state);
        setOnlineUsers(users);
      })
      .subscribe();

    // Track user presence
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      channel.track({
        user_id: user.id,
        online_at: new Date().toISOString(),
      });
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to send messages",
        variant: "destructive"
      });
      return;
    }

    const message: ChatMessage = {
      id: Date.now().toString(),
      content: newMessage,
      user_id: user.id,
      user_name: user.user_metadata?.full_name || 'Anonymous',
      room_id: activeRoom,
      created_at: new Date().toISOString(),
      message_type: 'text'
    };

    // Broadcast message to room
    const channel = supabase.channel(`chat_room_${activeRoom}`);
    await channel.send({
      type: 'broadcast',
      event: 'new_message',
      payload: message
    });

    setNewMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="h-[600px] grid grid-cols-1 lg:grid-cols-4 gap-4">
      {/* Chat Rooms Sidebar */}
      <Card className="bg-gray-900/80 backdrop-blur-sm border-gray-700">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2">
            <Users className="w-5 h-5" />
            <span>Chat Rooms</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-sm text-gray-400">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {rooms.map((room) => (
            <button
              key={room.id}
              onClick={() => setActiveRoom(room.id)}
              className={`w-full text-left p-3 rounded-lg transition-colors ${
                activeRoom === room.id 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              <div className="font-medium">{room.name}</div>
              <div className="text-xs opacity-75">{room.member_count} members</div>
            </button>
          ))}
        </CardContent>
      </Card>

      {/* Main Chat Area */}
      <Card className="lg:col-span-3 bg-gray-900/80 backdrop-blur-sm border-gray-700 flex flex-col">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle>
              {rooms.find(r => r.id === activeRoom)?.name || 'Chat'}
            </CardTitle>
            <Badge variant="outline" className="text-xs">
              {onlineUsers.length} online
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col space-y-4">
          {/* Messages */}
          <ScrollArea className="flex-1 h-[400px]">
            <div className="space-y-4 pr-4">
              {messages.map((message) => (
                <div key={message.id} className={`flex space-x-3 ${
                  message.message_type === 'system' ? 'justify-center' : ''
                }`}>
                  {message.message_type !== 'system' && (
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={message.user_avatar} />
                      <AvatarFallback>{message.user_name.charAt(0)}</AvatarFallback>
                    </Avatar>
                  )}
                  
                  <div className={`flex-1 ${message.message_type === 'system' ? 'text-center' : ''}`}>
                    {message.message_type === 'system' ? (
                      <div className="text-sm text-gray-400 bg-gray-800 rounded-lg px-3 py-1 inline-block">
                        {message.content}
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium text-white">{message.user_name}</span>
                          <span className="text-xs text-gray-400">
                            {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                          </span>
                        </div>
                        <div className="text-gray-300 bg-gray-800 rounded-lg px-3 py-2">
                          {message.content}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Message Input */}
          <div className="flex space-x-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="flex-1 bg-gray-800 border-gray-600"
            />
            <Button onClick={sendMessage} disabled={!newMessage.trim()}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LiveChat;
