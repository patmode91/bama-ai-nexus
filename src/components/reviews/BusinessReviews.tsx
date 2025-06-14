import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, MessageSquare, Plus } from 'lucide-react';
import { useBusinessReviews, Review } from '@/hooks/useReviews';
import { supabase } from '@/integrations/supabase/client';
import ReviewCard from './ReviewCard';
import ReviewForm from './ReviewForm';

interface BusinessReviewsProps {
  businessId: number;
}

const BusinessReviews = ({ businessId }: BusinessReviewsProps) => {
  const [user, setUser] = useState<any>(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  
  const { data: reviews, isLoading } = useBusinessReviews(businessId);

  useState(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });
  });

  const userReview = reviews?.find(review => review.user_id === user?.id);
  const otherReviews = reviews?.filter(review => review.user_id !== user?.id) || [];

  const averageRating = reviews?.length 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    : 0;

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-5 h-5 ${
          i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-400'
        }`}
      />
    ));
  };

  const handleEditReview = (review: Review) => {
    setEditingReview(review);
    setShowReviewForm(true);
  };

  const handleFormSuccess = () => {
    setShowReviewForm(false);
    setEditingReview(null);
  };

  const handleFormCancel = () => {
    setShowReviewForm(false);
    setEditingReview(null);
  };

  if (isLoading) {
    return (
      <Card className="bg-gray-800 border-gray-700">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-700 rounded w-1/3"></div>
            <div className="h-16 bg-gray-700 rounded"></div>
            <div className="h-16 bg-gray-700 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Reviews Summary */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Reviews & Ratings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-2">
              {renderStars(averageRating)}
              <span className="text-2xl font-bold text-white">
                {averageRating.toFixed(1)}
              </span>
            </div>
            <Badge variant="secondary" className="bg-gray-700 text-gray-300">
              {reviews?.length || 0} {reviews?.length === 1 ? 'review' : 'reviews'}
            </Badge>
          </div>

          {user && !userReview && !showReviewForm && (
            <Button
              onClick={() => setShowReviewForm(true)}
              className="bg-[#00C2FF] hover:bg-[#00A8D8]"
            >
              <Plus className="w-4 h-4 mr-2" />
              Write a Review
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Review Form */}
      {showReviewForm && user && (
        <ReviewForm
          businessId={businessId}
          existingReview={editingReview || undefined}
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
        />
      )}

      {/* User's Review */}
      {userReview && !showReviewForm && (
        <div>
          <h3 className="text-lg font-semibold text-white mb-3">Your Review</h3>
          <ReviewCard review={userReview} onEdit={handleEditReview} />
        </div>
      )}

      {/* Other Reviews */}
      {otherReviews.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-white mb-3">
            Other Reviews ({otherReviews.length})
          </h3>
          <div className="space-y-4">
            {otherReviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        </div>
      )}

      {reviews?.length === 0 && (
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6 text-center">
            <MessageSquare className="w-12 h-12 text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">No Reviews Yet</h3>
            <p className="text-gray-400 mb-4">
              Be the first to share your experience with this business.
            </p>
            {user && (
              <Button
                onClick={() => setShowReviewForm(true)}
                className="bg-[#00C2FF] hover:bg-[#00A8D8]"
              >
                Write the First Review
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BusinessReviews;
