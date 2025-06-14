
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MessageSquare, ThumbsUp, Eye, Clock, Pin, Lock } from 'lucide-react';
import { ForumTopic } from '@/types/forums';
import { formatDistanceToNow } from 'date-fns';
import { useForums } from '@/hooks/useForums';

interface ForumCardProps {
  topic: ForumTopic;
  onClick: () => void;
}

const ForumCard = ({ topic, onClick }: ForumCardProps) => {
  const { vote, isVoting } = useForums();

  const handleVote = (e: React.MouseEvent, voteType: 'up' | 'down') => {
    e.stopPropagation();
    vote({
      type: 'topic',
      targetId: topic.id,
      voteType,
      currentVote: topic.user_vote,
    });
  };

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={onClick}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {topic.is_pinned && (
                <Pin className="w-4 h-4 text-blue-500" />
              )}
              {topic.is_locked && (
                <Lock className="w-4 h-4 text-gray-500" />
              )}
              {topic.category && (
                <Badge 
                  variant="secondary" 
                  className="text-xs"
                  style={{ backgroundColor: topic.category.color + '20', color: topic.category.color }}
                >
                  {topic.category.name}
                </Badge>
              )}
            </div>
            <CardTitle className="text-lg leading-tight">{topic.title}</CardTitle>
          </div>
          <div className="flex flex-col items-center gap-1 ml-4">
            <Button
              variant={topic.user_vote === 'up' ? 'default' : 'ghost'}
              size="sm"
              className="h-8 w-8 p-0"
              onClick={(e) => handleVote(e, 'up')}
              disabled={isVoting}
            >
              <ThumbsUp className="w-4 h-4" />
            </Button>
            <span className="text-sm font-medium">{topic.upvotes || 0}</span>
            <Button
              variant={topic.user_vote === 'down' ? 'default' : 'ghost'}
              size="sm"
              className="h-8 w-8 p-0 rotate-180"
              onClick={(e) => handleVote(e, 'down')}
              disabled={isVoting}
            >
              <ThumbsUp className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600 text-sm line-clamp-2 mb-3">{topic.content}</p>
        
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <MessageSquare className="w-3 h-3" />
              <span>{topic.reply_count || 0}</span>
            </div>
            <div className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              <span>{topic.views_count || 0}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <span>by {topic.author?.full_name || 'Anonymous'}</span>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{formatDistanceToNow(new Date(topic.last_reply_at || topic.created_at))} ago</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ForumCard;
