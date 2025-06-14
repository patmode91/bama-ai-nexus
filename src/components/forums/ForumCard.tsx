
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, User, Calendar } from 'lucide-react';
import { ForumTopic } from '@/types/forums';

interface ForumCardProps {
  topic: ForumTopic;
  onClick: () => void;
}

const ForumCard = ({ topic, onClick }: ForumCardProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <Card 
      className="bg-gray-800 border-gray-700 hover:border-gray-600 cursor-pointer transition-colors"
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-white text-lg mb-2">{topic.title}</CardTitle>
            <div className="flex items-center gap-4 text-sm text-gray-400">
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
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge 
              style={{ backgroundColor: topic.category?.color || '#3B82F6' }}
              className="text-white"
            >
              {topic.category?.name || 'General'}
            </Badge>
            <div className="flex items-center gap-1 text-sm text-gray-400">
              <MessageSquare className="w-4 h-4" />
              <span>{topic.views_count || 0} views</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-gray-300 text-sm line-clamp-2">
          {topic.content?.slice(0, 150)}...
        </p>
      </CardContent>
    </Card>
  );
};

export default ForumCard;
