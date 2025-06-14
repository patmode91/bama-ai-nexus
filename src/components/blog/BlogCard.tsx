
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, User, ExternalLink } from 'lucide-react';
import { BlogPost } from '@/types/blog';

interface BlogCardProps {
  post: BlogPost;
  onRead: (post: BlogPost) => void;
}

const BlogCard = ({ post, onRead }: BlogCardProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getAuthorIcon = () => {
    return post.author === 'The Scribe' ? '🤖' : '👤';
  };

  const getCategoryColor = () => {
    switch (post.category) {
      case 'Market Pulse': return 'bg-blue-400/20 text-blue-400';
      case 'New Innovator': return 'bg-green-400/20 text-green-400';
      case 'Funding Roundup': return 'bg-yellow-400/20 text-yellow-400';
      case 'AI Interview': return 'bg-purple-400/20 text-purple-400';
      default: return 'bg-gray-400/20 text-gray-400';
    }
  };

  return (
    <Card className="bg-gray-800 border-gray-700 hover:bg-gray-750 transition-colors group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <h3 className="font-semibold text-white group-hover:text-[#00C2FF] transition-colors line-clamp-2">
              {post.title}
            </h3>
            <p className="text-gray-400 text-sm mt-2 line-clamp-2">
              {post.excerpt}
            </p>
          </div>
          {post.featured_image && (
            <div className="w-16 h-16 rounded-lg bg-gray-700 flex-shrink-0 overflow-hidden">
              <img 
                src={post.featured_image} 
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="flex flex-wrap gap-2 mb-4">
          <Badge className={getCategoryColor()}>
            {post.category}
          </Badge>
          {post.metadata?.auto_generated && (
            <Badge variant="outline" className="text-gray-400 text-xs">
              AI-Generated
            </Badge>
          )}
          {post.tags.slice(0, 2).map(tag => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>

        <div className="flex items-center justify-between text-sm text-gray-400">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <User className="w-3 h-3" />
              <span className="flex items-center gap-1">
                {getAuthorIcon()} {post.author}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>{formatDate(post.published_at)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{post.read_time_minutes} min read</span>
            </div>
          </div>
          
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onRead(post)}
            className="text-[#00C2FF] hover:text-[#0099CC] hover:bg-gray-700"
          >
            Read <ExternalLink className="w-3 h-3 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default BlogCard;
