
import React, { useState } from 'react';
import { ArrowLeft, MessageSquare, User, Calendar, ThumbsUp, Reply } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ForumTopic, ForumReply } from '@/types/forums';
import { useForums } from '@/hooks/useForums';

interface TopicViewProps {
  topic: ForumTopic;
  replies: ForumReply[];
  isLoading?: boolean;
  onBack: () => void;
}

const TopicView = ({ topic, replies, isLoading, onBack }: TopicViewProps) => {
  const [replyContent, setReplyContent] = useState('');
  const { createReply, isCreatingReply, vote, isVoting } = useForums();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleReply = () => {
    if (!replyContent.trim()) return;
    
    createReply({
      topic_id: topic.id,
      content: replyContent
    });
    
    setReplyContent('');
  };

  const handleVote = (targetId: string, targetType: 'topic' | 'reply', voteType: 'up' | 'down') => {
    vote(targetId, targetType, voteType);
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-400">Loading topic...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button 
        onClick={onBack}
        variant="outline" 
        className="border-gray-600 text-gray-300 hover:text-white"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Forums
      </Button>

      {/* Topic */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-white text-xl mb-3">{topic.title}</CardTitle>
              <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
                <div className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  <span>{topic.author?.full_name || 'Anonymous'}</span>
                  {topic.author?.company && (
                    <span className="text-gray-500">• {topic.author.company}</span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(topic.created_at)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageSquare className="w-4 h-4" />
                  <span>{topic.views_count || 0} views</span>
                </div>
              </div>
            </div>
            <Badge 
              style={{ backgroundColor: topic.category?.color || '#3B82F6' }}
              className="text-white"
            >
              {topic.category?.name || 'General'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="prose prose-invert max-w-none">
            <p className="text-gray-300 whitespace-pre-wrap">{topic.content}</p>
          </div>
          
          <div className="flex items-center gap-2 mt-6 pt-4 border-t border-gray-700">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleVote(topic.id, 'topic', 'up')}
              disabled={isVoting}
              className="text-gray-400 hover:text-green-400"
            >
              <ThumbsUp className="w-4 h-4 mr-1" />
              Upvote
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Replies */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-white">
          Replies ({replies.length})
        </h3>
        
        {replies.map((reply) => (
          <Card key={reply.id} className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-4 text-sm text-gray-400">
                <div className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  <span>{reply.author?.full_name || 'Anonymous'}</span>
                  {reply.author?.company && (
                    <span className="text-gray-500">• {reply.author.company}</span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(reply.created_at)}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="prose prose-invert max-w-none">
                <p className="text-gray-300 whitespace-pre-wrap">{reply.content}</p>
              </div>
              
              <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-700">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleVote(reply.id, 'reply', 'up')}
                  disabled={isVoting}
                  className="text-gray-400 hover:text-green-400"
                >
                  <ThumbsUp className="w-4 h-4 mr-1" />
                  {reply.upvotes || 0}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Reply Form */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Reply className="w-5 h-5" />
            Post a Reply
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            placeholder="Share your thoughts..."
            className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
            rows={4}
          />
          <div className="flex justify-end">
            <Button
              onClick={handleReply}
              disabled={!replyContent.trim() || isCreatingReply}
              className="bg-[#00C2FF] hover:bg-[#00A8D8]"
            >
              {isCreatingReply ? 'Posting...' : 'Post Reply'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TopicView;
