
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MessageSquare, User } from 'lucide-react';

interface TopicViewProps {
  topic: {
    id: string;
    title: string;
    content: string;
    created_at: string;
    author_id: string;
    forum_categories?: {
      name: string;
      color?: string;
    };
    profiles?: {
      full_name?: string;
    };
  };
  replies?: any[];
  onBack?: () => void;
}

const TopicView = ({ topic, replies = [], onBack }: TopicViewProps) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        {onBack && (
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Forum
          </Button>
        )}
        {topic.forum_categories && (
          <Badge 
            variant="secondary"
            style={{ backgroundColor: topic.forum_categories.color }}
          >
            {topic.forum_categories.name}
          </Badge>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{topic.title}</CardTitle>
          <div className="flex items-center space-x-4 text-gray-600">
            <div className="flex items-center space-x-2">
              <User className="w-4 h-4" />
              <span>{topic.profiles?.full_name || 'Anonymous'}</span>
            </div>
            <span>•</span>
            <span>{new Date(topic.created_at).toLocaleDateString()}</span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="prose max-w-none">
            <p className="text-gray-700 whitespace-pre-wrap">{topic.content}</p>
          </div>
        </CardContent>
      </Card>

      {replies.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold flex items-center space-x-2">
            <MessageSquare className="w-5 h-5" />
            <span>{replies.length} Replies</span>
          </h3>
          {replies.map((reply) => (
            <Card key={reply.id}>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2 mb-3 text-sm text-gray-600">
                  <User className="w-4 h-4" />
                  <span>{reply.profiles?.full_name || 'Anonymous'}</span>
                  <span>•</span>
                  <span>{new Date(reply.created_at).toLocaleDateString()}</span>
                </div>
                <p className="text-gray-700 whitespace-pre-wrap">{reply.content}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default TopicView;
