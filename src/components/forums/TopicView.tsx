
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ThumbsUp, MessageSquare, Eye, Clock, Pin, Lock, ArrowLeft } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useForums } from '@/hooks/useForums';
import { ForumTopic, ForumReply } from '@/types/forums';

interface TopicViewProps {
  topic: ForumTopic;
  replies: ForumReply[];
  onBack: () => void;
}

const TopicView = ({ topic, replies, onBack }: TopicViewProps) => {
  const { createReply, isCreatingReply, vote, isVoting } = useForums();
  const [replyContent, setReplyContent] = useState('');

  const handleVote = (type: 'topic' | 'reply', targetId: string, voteType: 'up' | 'down', currentVote?: 'up' | 'down' | null) => {
    vote({
      type,
      targetId,
      voteType,
      currentVote,
    });
  };

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!replyContent.trim()) return;

    createReply({
      topic_id: topic.id,
      content: replyContent,
    }, {
      onSuccess: () => {
        setReplyContent('');
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Topics
        </Button>
      </div>

      {/* Topic */}
      <Card>
        <CardHeader>
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
                    style={{ backgroundColor: topic.category.color + '20', color: topic.category.color }}
                  >
                    {topic.category.name}
                  </Badge>
                )}
              </div>
              <h1 className="text-2xl font-bold">{topic.title}</h1>
              
              <div className="flex items-center gap-4 text-sm text-gray-500 mt-2">
                <span>by {topic.author?.full_name || 'Anonymous'}</span>
                {topic.author?.company && (
                  <span>from {topic.author.company}</span>
                )}
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{formatDistanceToNow(new Date(topic.created_at))} ago</span>
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  <span>{topic.views_count || 0} views</span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col items-center gap-1 ml-4">
              <Button
                variant={topic.user_vote === 'up' ? 'default' : 'ghost'}
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => handleVote('topic', topic.id, 'up', topic.user_vote)}
                disabled={isVoting}
              >
                <ThumbsUp className="w-4 h-4" />
              </Button>
              <span className="text-sm font-medium">{topic.upvotes || 0}</span>
              <Button
                variant={topic.user_vote === 'down' ? 'default' : 'ghost'}
                size="sm"
                className="h-8 w-8 p-0 rotate-180"
                onClick={() => handleVote('topic', topic.id, 'down', topic.user_vote)}
                disabled={isVoting}
              >
                <ThumbsUp className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="prose max-w-none">
            <p className="whitespace-pre-wrap">{topic.content}</p>
          </div>
        </CardContent>
      </Card>

      {/* Replies */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          Replies ({replies.length})
        </h2>

        {replies.map((reply) => (
          <Card key={reply.id}>
            <CardContent className="pt-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2 text-sm text-gray-500">
                    <span className="font-medium">{reply.author?.full_name || 'Anonymous'}</span>
                    {reply.author?.company && (
                      <span>from {reply.author.company}</span>
                    )}
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{formatDistanceToNow(new Date(reply.created_at))} ago</span>
                    </div>
                  </div>
                  <div className="prose max-w-none">
                    <p className="whitespace-pre-wrap">{reply.content}</p>
                  </div>
                </div>
                
                <div className="flex flex-col items-center gap-1 ml-4">
                  <Button
                    variant={reply.user_vote === 'up' ? 'default' : 'ghost'}
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => handleVote('reply', reply.id, 'up', reply.user_vote)}
                    disabled={isVoting}
                  >
                    <ThumbsUp className="w-3 h-3" />
                  </Button>
                  <span className="text-xs font-medium">{reply.upvotes || 0}</span>
                  <Button
                    variant={reply.user_vote === 'down' ? 'default' : 'ghost'}
                    size="sm"
                    className="h-6 w-6 p-0 rotate-180"
                    onClick={() => handleVote('reply', reply.id, 'down', reply.user_vote)}
                    disabled={isVoting}
                  >
                    <ThumbsUp className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Reply Form */}
      {!topic.is_locked && (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Post a Reply</h3>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitReply} className="space-y-4">
              <Textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Share your thoughts..."
                rows={4}
                required
              />
              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={isCreatingReply || !replyContent.trim()}
                >
                  {isCreatingReply ? 'Posting...' : 'Post Reply'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TopicView;
