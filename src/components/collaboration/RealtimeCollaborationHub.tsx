
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  MessageSquare, 
  Video, 
  Share2, 
  FileText,
  Clock,
  Eye,
  Edit3,
  Send,
  UserPlus,
  Settings
} from 'lucide-react';

interface User {
  id: string;
  name: string;
  avatar: string;
  status: 'online' | 'away' | 'busy' | 'offline';
  role: string;
  lastSeen: number;
}

interface Message {
  id: string;
  userId: string;
  content: string;
  timestamp: number;
  type: 'text' | 'file' | 'system';
}

interface ActiveSession {
  id: string;
  type: 'document' | 'meeting' | 'brainstorm';
  title: string;
  participants: string[];
  startTime: number;
  isActive: boolean;
}

const RealtimeCollaborationHub: React.FC = () => {
  const [activeUsers, setActiveUsers] = useState<User[]>([
    {
      id: '1',
      name: 'Sarah Johnson',
      avatar: '/placeholder.svg',
      status: 'online',
      role: 'Business Analyst',
      lastSeen: Date.now()
    },
    {
      id: '2',
      name: 'Mike Chen',
      avatar: '/placeholder.svg',
      status: 'online',
      role: 'AI Specialist',
      lastSeen: Date.now() - 120000
    },
    {
      id: '3',
      name: 'Emma Davis',
      avatar: '/placeholder.svg',
      status: 'away',
      role: 'Data Curator',
      lastSeen: Date.now() - 300000
    },
    {
      id: '4',
      name: 'Alex Rodriguez',
      avatar: '/placeholder.svg',
      status: 'busy',
      role: 'System Admin',
      lastSeen: Date.now() - 600000
    }
  ]);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      userId: '1',
      content: 'Hey everyone! I just finished analyzing the Q4 business data. The AI sector shows 23% growth.',
      timestamp: Date.now() - 900000,
      type: 'text'
    },
    {
      id: '2',
      userId: '2',
      content: 'Great work Sarah! I\'ve updated the machine learning models with the new data.',
      timestamp: Date.now() - 600000,
      type: 'text'
    },
    {
      id: '3',
      userId: '3',
      content: 'The data quality looks excellent. I\'ve curated 45 new business profiles today.',
      timestamp: Date.now() - 300000,
      type: 'text'
    }
  ]);

  const [activeSessions, setActiveSessions] = useState<ActiveSession[]>([
    {
      id: '1',
      type: 'document',
      title: 'Q4 Business Intelligence Report',
      participants: ['1', '2'],
      startTime: Date.now() - 1800000,
      isActive: true
    },
    {
      id: '2',
      type: 'meeting',
      title: 'AI Strategy Planning',
      participants: ['1', '2', '3'],
      startTime: Date.now() - 3600000,
      isActive: false
    },
    {
      id: '3',
      type: 'brainstorm',
      title: 'New Feature Ideation',
      participants: ['2', '4'],
      startTime: Date.now() - 600000,
      isActive: true
    }
  ]);

  const [newMessage, setNewMessage] = useState('');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'busy': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getSessionIcon = (type: string) => {
    switch (type) {
      case 'document': return <FileText className="w-4 h-4" />;
      case 'meeting': return <Video className="w-4 h-4" />;
      case 'brainstorm': return <Edit3 className="w-4 h-4" />;
      default: return <MessageSquare className="w-4 h-4" />;
    }
  };

  const formatTimestamp = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    return `${hours}h ago`;
  };

  const sendMessage = () => {
    if (!newMessage.trim()) return;

    const message: Message = {
      id: Date.now().toString(),
      userId: '1', // Current user
      content: newMessage,
      timestamp: Date.now(),
      type: 'text'
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="space-y-6">
      {/* Active Users Bar */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Users className="w-5 h-5" />
            Active Collaborators ({activeUsers.filter(u => u.status === 'online').length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {activeUsers.map((user) => (
              <div key={user.id} className="flex items-center space-x-2 p-2 bg-gray-900 rounded-lg">
                <div className="relative">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-gray-900 ${getStatusColor(user.status)}`} />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{user.name}</p>
                  <p className="text-xs text-gray-400">{user.role}</p>
                </div>
                <Badge variant="outline" className="text-xs">
                  {user.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Chat Section */}
        <div className="lg:col-span-2">
          <Card className="bg-gray-800 border-gray-700 h-96">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Team Chat
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              <ScrollArea className="flex-1 mb-4">
                <div className="space-y-3">
                  {messages.map((message) => {
                    const user = activeUsers.find(u => u.id === message.userId);
                    return (
                      <div key={message.id} className="flex items-start space-x-3">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={user?.avatar} />
                          <AvatarFallback>{user?.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="text-sm font-medium text-white">{user?.name}</span>
                            <span className="text-xs text-gray-400">{formatTimestamp(message.timestamp)}</span>
                          </div>
                          <p className="text-sm text-gray-300">{message.content}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
              <div className="flex space-x-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type a message..."
                  className="bg-gray-900 border-gray-600 text-white"
                />
                <Button onClick={sendMessage} size="sm">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sessions Sidebar */}
        <div>
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Share2 className="w-5 h-5" />
                Active Sessions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {activeSessions.map((session) => (
                  <div key={session.id} className="p-3 bg-gray-900 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        {getSessionIcon(session.type)}
                        <Badge variant={session.isActive ? 'default' : 'secondary'}>
                          {session.isActive ? 'Active' : 'Ended'}
                        </Badge>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                    <h4 className="font-medium text-white text-sm mb-1">{session.title}</h4>
                    <div className="flex items-center space-x-2 text-xs text-gray-400">
                      <Users className="w-3 h-3" />
                      <span>{session.participants.length} participants</span>
                      <Clock className="w-3 h-3 ml-2" />
                      <span>{formatTimestamp(session.startTime)}</span>
                    </div>
                  </div>
                ))}
              </div>
              
              <Button className="w-full mt-4" variant="outline">
                <UserPlus className="w-4 h-4 mr-2" />
                Start New Session
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default RealtimeCollaborationHub;
