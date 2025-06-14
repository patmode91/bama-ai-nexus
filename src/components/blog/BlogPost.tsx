
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, Clock, User, Share2, Bookmark } from 'lucide-react';
import { BlogPost as BlogPostType } from '@/types/blog';

interface BlogPostProps {
  post: BlogPostType;
  onBack: () => void;
}

const BlogPost = ({ post, onBack }: BlogPostProps) => {
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

  const formatContent = (content: string) => {
    // Simple markdown-style formatting
    return content
      .split('\n')
      .map((line, index) => {
        if (line.startsWith('# ')) {
          return <h1 key={index} className="text-3xl font-bold text-white mt-8 mb-4">{line.slice(2)}</h1>;
        }
        if (line.startsWith('## ')) {
          return <h2 key={index} className="text-2xl font-semibold text-white mt-6 mb-3">{line.slice(3)}</h2>;
        }
        if (line.startsWith('### ')) {
          return <h3 key={index} className="text-xl font-semibold text-white mt-4 mb-2">{line.slice(4)}</h3>;
        }
        if (line.startsWith('- ')) {
          return <li key={index} className="text-gray-300 mb-1 ml-4">{line.slice(2)}</li>;
        }
        if (line.startsWith('**') && line.endsWith('**')) {
          return <p key={index} className="text-gray-300 mb-3 font-semibold">{line.slice(2, -2)}</p>;
        }
        if (line.startsWith('*') && line.endsWith('*')) {
          return <p key={index} className="text-gray-400 text-sm italic mb-3">{line.slice(1, -1)}</p>;
        }
        if (line.trim() === '') {
          return <br key={index} />;
        }
        return <p key={index} className="text-gray-300 mb-3 leading-relaxed">{line}</p>;
      });
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Button
        variant="ghost"
        onClick={onBack}
        className="mb-6 text-gray-400 hover:text-white"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Blog
      </Button>

      <Card className="bg-gray-800 border-gray-700">
        <CardHeader className="pb-6">
          {post.featured_image && (
            <div className="w-full h-64 rounded-lg overflow-hidden mb-6">
              <img 
                src={post.featured_image} 
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="flex flex-wrap gap-2 mb-4">
            <Badge className={getCategoryColor()}>
              {post.category}
            </Badge>
            {post.metadata?.auto_generated && (
              <Badge variant="outline" className="text-gray-400">
                AI-Generated
              </Badge>
            )}
            {post.tags.map(tag => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {post.title}
          </h1>

          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-6 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span className="flex items-center gap-1">
                  {getAuthorIcon()} {post.author}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(post.published_at)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{post.read_time_minutes} min read</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button size="sm" variant="outline">
                <Bookmark className="w-4 h-4 mr-2" />
                Save
              </Button>
            </div>
          </div>

          {post.author === 'The Scribe' && (
            <Card className="bg-purple-400/10 border-purple-400/20 mt-4">
              <CardContent className="p-4">
                <p className="text-purple-300 text-sm">
                  <strong>AI Transparency:</strong> This article was automatically generated by The Scribe 
                  (BamaAI Content Agent) based on data from the BamaAI Connect platform and was reviewed 
                  for accuracy by our editorial team.
                </p>
              </CardContent>
            </Card>
          )}
        </CardHeader>

        <CardContent className="prose prose-invert max-w-none">
          <div className="text-gray-300 leading-relaxed">
            {formatContent(post.content)}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BlogPost;
