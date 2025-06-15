
import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Heart, MessageCircle, Share2, Users, Calendar, TrendingUp } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface SocialPost {
  id: string;
  type: 'announcement' | 'event' | 'collaboration' | 'success_story' | 'question';
  author: {
    id: string;
    name: string;
    company: string;
    avatar?: string;
    verified: boolean;
  };
  content: string;
  images?: string[];
  tags: string[];
  likes: number;
  comments: number;
  shares: number;
  timestamp: string;
  isLiked: boolean;
}

const mockPosts: SocialPost[] = [
  {
    id: '1',
    type: 'success_story',
    author: {
      id: '1',
      name: 'Sarah Johnson',
      company: 'Tech Solutions AL',
      verified: true
    },
    content: 'Just closed our biggest deal of the year thanks to a connection made through BamaAI Connect! The networking events have been incredible for growing our business.',
    tags: ['networking', 'success', 'growth'],
    likes: 24,
    comments: 8,
    shares: 3,
    timestamp: '2024-01-15T10:30:00Z',
    isLiked: false
  },
  {
    id: '2',
    type: 'collaboration',
    author: {
      id: '2',
      name: 'Mike Davis',
      company: 'Alabama Marketing Co',
      verified: false
    },
    content: 'Looking for a reliable web development partner for our upcoming projects. Anyone have recommendations for local Alabama companies?',
    tags: ['collaboration', 'web-development', 'partnerships'],
    likes: 12,
    comments: 15,
    shares: 5,
    timestamp: '2024-01-15T08:15:00Z',
    isLiked: true
  },
  {
    id: '3',
    type: 'event',
    author: {
      id: '3',
      name: 'Birmingham Chamber',
      company: 'Birmingham Chamber of Commerce',
      verified: true
    },
    content: 'Join us next Thursday for our monthly Business Networking Mixer! Great opportunity to connect with fellow Alabama entrepreneurs.',
    tags: ['event', 'networking', 'birmingham'],
    likes: 45,
    comments: 22,
    shares: 18,
    timestamp: '2024-01-14T16:45:00Z',
    isLiked: false
  }
];

const SocialFeed = () => {
  const [posts, setPosts] = useState<SocialPost[]>(mockPosts);
  const [filter, setFilter] = useState<string>('all');

  const getPostTypeIcon = (type: string) => {
    switch (type) {
      case 'event':
        return <Calendar className="w-4 h-4" />;
      case 'collaboration':
        return <Users className="w-4 h-4" />;
      case 'success_story':
        return <TrendingUp className="w-4 h-4" />;
      default:
        return <MessageCircle className="w-4 h-4" />;
    }
  };

  const getPostTypeBadge = (type: string) => {
    const configs = {
      announcement: { label: 'Announcement', color: 'bg-blue-500' },
      event: { label: 'Event', color: 'bg-green-500' },
      collaboration: { label: 'Collaboration', color: 'bg-purple-500' },
      success_story: { label: 'Success Story', color: 'bg-yellow-500' },
      question: { label: 'Question', color: 'bg-orange-500' }
    };
    
    const config = configs[type as keyof typeof configs] || configs.announcement;
    
    return (
      <Badge className={`${config.color} text-white`}>
        {getPostTypeIcon(type)}
        <span className="ml-1">{config.label}</span>
      </Badge>
    );
  };

  const handleLike = (postId: string) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { 
            ...post, 
            isLiked: !post.isLiked,
            likes: post.isLiked ? post.likes - 1 : post.likes + 1
          }
        : post
    ));
  };

  const filteredPosts = filter === 'all' 
    ? posts 
    : posts.filter(post => post.type === filter);

  return (
    <div className="space-y-6">
      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {['all', 'announcement', 'event', 'collaboration', 'success_story', 'question'].map((filterType) => (
          <Button
            key={filterType}
            variant={filter === filterType ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(filterType)}
            className="capitalize"
          >
            {filterType.replace('_', ' ')}
          </Button>
        ))}
      </div>

      {/* Posts */}
      <div className="space-y-4">
        {filteredPosts.map((post) => (
          <Card key={post.id} className="bg-gray-900/80 backdrop-blur-sm border-gray-700">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarImage src={post.author.avatar} />
                    <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-semibold text-white">{post.author.name}</h4>
                      {post.author.verified && (
                        <Badge variant="secondary" className="text-xs">✓ Verified</Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-400">{post.author.company}</p>
                    <p className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(post.timestamp), { addSuffix: true })}
                    </p>
                  </div>
                </div>
                {getPostTypeBadge(post.type)}
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <p className="text-gray-300">{post.content}</p>
              
              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    #{tag}
                  </Badge>
                ))}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-700">
                <div className="flex items-center space-x-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleLike(post.id)}
                    className={`flex items-center space-x-1 ${
                      post.isLiked ? 'text-red-500' : 'text-gray-400'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${post.isLiked ? 'fill-current' : ''}`} />
                    <span>{post.likes}</span>
                  </Button>
                  
                  <Button variant="ghost" size="sm" className="flex items-center space-x-1 text-gray-400">
                    <MessageCircle className="w-4 h-4" />
                    <span>{post.comments}</span>
                  </Button>
                  
                  <Button variant="ghost" size="sm" className="flex items-center space-x-1 text-gray-400">
                    <Share2 className="w-4 h-4" />
                    <span>{post.shares}</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SocialFeed;
