
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, MessageSquare, Calendar, Star, Search, Filter } from 'lucide-react';

interface NetworkConnection {
  id: string;
  name: string;
  company: string;
  role: string;
  avatar?: string;
  isConnected: boolean;
  mutualConnections: number;
  tags: string[];
  lastInteraction?: string;
}

interface NetworkingEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  attendees: number;
  type: 'online' | 'in-person' | 'hybrid';
  categories: string[];
}

const mockConnections: NetworkConnection[] = [
  {
    id: '1',
    name: 'Sarah Chen',
    company: 'Tech Innovators AL',
    role: 'CEO',
    isConnected: true,
    mutualConnections: 12,
    tags: ['technology', 'startups', 'AI'],
    lastInteraction: '2 days ago'
  },
  {
    id: '2',
    name: 'Michael Rodriguez',
    company: 'Alabama Construction Co',
    role: 'Project Manager',
    isConnected: false,
    mutualConnections: 5,
    tags: ['construction', 'real-estate', 'project-management']
  },
  {
    id: '3',
    name: 'Emily Davis',
    company: 'Creative Marketing Solutions',
    role: 'Marketing Director',
    isConnected: true,
    mutualConnections: 8,
    tags: ['marketing', 'branding', 'digital'],
    lastInteraction: '1 week ago'
  }
];

const mockEvents: NetworkingEvent[] = [
  {
    id: '1',
    title: 'Alabama Tech Entrepreneurs Meetup',
    date: '2024-01-25',
    time: '6:00 PM',
    location: 'Birmingham Innovation Hub',
    attendees: 45,
    type: 'in-person',
    categories: ['technology', 'entrepreneurship']
  },
  {
    id: '2',
    title: 'Virtual Business Growth Workshop',
    date: '2024-01-28',
    time: '2:00 PM',
    location: 'Zoom',
    attendees: 120,
    type: 'online',
    categories: ['business-growth', 'strategy']
  }
];

const BusinessNetworking = () => {
  const [connections, setConnections] = useState<NetworkConnection[]>(mockConnections);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const handleConnect = (connectionId: string) => {
    setConnections(connections.map(conn => 
      conn.id === connectionId 
        ? { ...conn, isConnected: !conn.isConnected }
        : conn
    ));
  };

  const filteredConnections = connections.filter(conn =>
    conn.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conn.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <Tabs defaultValue="connections" className="space-y-4">
        <TabsList className="bg-gray-800 border-gray-700">
          <TabsTrigger value="connections">
            <Users className="w-4 h-4 mr-2" />
            Connections
          </TabsTrigger>
          <TabsTrigger value="discover">
            <Search className="w-4 h-4 mr-2" />
            Discover
          </TabsTrigger>
          <TabsTrigger value="events">
            <Calendar className="w-4 h-4 mr-2" />
            Events
          </TabsTrigger>
          <TabsTrigger value="messages">
            <MessageSquare className="w-4 h-4 mr-2" />
            Messages
          </TabsTrigger>
        </TabsList>

        <TabsContent value="connections" className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search connections..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-gray-800 border-gray-600"
              />
            </div>
            <Button variant="outline" className="shrink-0">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredConnections.map((connection) => (
              <Card key={connection.id} className="bg-gray-900/80 backdrop-blur-sm border-gray-700">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-4">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={connection.avatar} />
                      <AvatarFallback>{connection.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white truncate">{connection.name}</h3>
                      <p className="text-sm text-gray-400">{connection.role}</p>
                      <p className="text-sm text-gray-400">{connection.company}</p>
                      
                      {connection.mutualConnections > 0 && (
                        <p className="text-xs text-blue-400 mt-1">
                          {connection.mutualConnections} mutual connections
                        </p>
                      )}
                      
                      {connection.lastInteraction && (
                        <p className="text-xs text-gray-500 mt-1">
                          Last interaction: {connection.lastInteraction}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-3 flex flex-wrap gap-1">
                    {connection.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="mt-4 flex gap-2">
                    <Button
                      size="sm"
                      variant={connection.isConnected ? "outline" : "default"}
                      onClick={() => handleConnect(connection.id)}
                      className="flex-1"
                    >
                      {connection.isConnected ? 'Connected' : 'Connect'}
                    </Button>
                    <Button size="sm" variant="ghost">
                      <MessageSquare className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="discover" className="space-y-4">
          <Card className="bg-gray-900/80 backdrop-blur-sm border-gray-700">
            <CardHeader>
              <CardTitle>Discover New Connections</CardTitle>
              <CardDescription>
                Find businesses and professionals that align with your interests
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-400">
                <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>AI-powered connection recommendations coming soon!</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {mockEvents.map((event) => (
              <Card key={event.id} className="bg-gray-900/80 backdrop-blur-sm border-gray-700">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{event.title}</CardTitle>
                      <CardDescription className="mt-1">
                        {event.date} at {event.time}
                      </CardDescription>
                    </div>
                    <Badge variant={event.type === 'online' ? 'secondary' : 'default'}>
                      {event.type}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2 text-gray-400">
                    <Calendar className="w-4 h-4" />
                    <span>{event.location}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-gray-400">
                    <Users className="w-4 h-4" />
                    <span>{event.attendees} attendees</span>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {event.categories.map((category) => (
                      <Badge key={category} variant="outline" className="text-xs">
                        {category}
                      </Badge>
                    ))}
                  </div>
                  
                  <Button className="w-full">
                    RSVP to Event
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="messages" className="space-y-4">
          <Card className="bg-gray-900/80 backdrop-blur-sm border-gray-700">
            <CardHeader>
              <CardTitle>Recent Messages</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-400">
                <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>No messages yet. Start connecting with other businesses!</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BusinessNetworking;
