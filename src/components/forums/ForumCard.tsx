
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Users } from 'lucide-react';

interface ForumCardProps {
  category: {
    id: string;
    name: string;
    description?: string;
    icon?: string;
    color?: string;
  };
}

const ForumCard = ({ category }: ForumCardProps) => {
  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
      <CardHeader>
        <div className="flex items-center space-x-3">
          <div 
            className="w-12 h-12 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: category.color || '#3B82F6' }}
          >
            <MessageSquare className="w-6 h-6 text-white" />
          </div>
          <div>
            <CardTitle className="text-lg">{category.name}</CardTitle>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Users className="w-4 h-4" />
              <span>124 members</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600 mb-4">
          {category.description || 'Join the discussion and connect with the community.'}
        </p>
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">Active</Badge>
          <Badge variant="outline">Public</Badge>
        </div>
      </CardContent>
    </Card>
  );
};

export default ForumCard;
