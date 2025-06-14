
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Edit, Trash2, User } from 'lucide-react';
import { Review, useDeleteReview } from '@/hooks/useReviews';
import { supabase } from '@/integrations/supabase/client';

interface ReviewCardProps {
  review: Review;
  onEdit?: (review: Review) => void;
}

const ReviewCard = ({ review, onEdit }: ReviewCardProps) => {
  const [user, setUser] = useState<any>(null);
  const deleteReview = useDeleteReview();

  useState(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });
  });

  const isOwner = user?.id === review.user_id;

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this review?')) {
      deleteReview.mutate(review.id);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-400'
        }`}
      />
    ));
  };

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-[#00C2FF] rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                {renderStars(review.rating)}
                <Badge variant="outline" className="text-xs border-gray-600 text-gray-300">
                  {review.rating}/5
                </Badge>
              </div>
              <p className="text-sm text-gray-400">
                {new Date(review.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
          
          {isOwner && (
            <div className="flex gap-2">
              {onEdit && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(review)}
                  className="text-gray-400 hover:text-[#00C2FF]"
                >
                  <Edit className="w-4 h-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                disabled={deleteReview.isPending}
                className="text-gray-400 hover:text-red-400"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>

        {review.title && (
          <h4 className="text-lg font-semibold text-white mb-2">{review.title}</h4>
        )}
        
        {review.comment && (
          <p className="text-gray-300 leading-relaxed">{review.comment}</p>
        )}
      </CardContent>
    </Card>
  );
};

export default ReviewCard;
