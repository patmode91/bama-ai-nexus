
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Star } from 'lucide-react';
import { useCreateReview, useUpdateReview, Review } from '@/hooks/useReviews';
import { useToast } from '@/hooks/use-toast';

interface ReviewFormProps {
  businessId: number;
  existingReview?: Review;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const ReviewForm = ({ businessId, existingReview, onSuccess, onCancel }: ReviewFormProps) => {
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [title, setTitle] = useState(existingReview?.title || '');
  const [comment, setComment] = useState(existingReview?.comment || '');

  const createReview = useCreateReview();
  const updateReview = useUpdateReview();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      toast({
        title: "Rating Required",
        description: "Please select a rating before submitting.",
        variant: "destructive",
      });
      return;
    }

    try {
      if (existingReview) {
        await updateReview.mutateAsync({
          id: existingReview.id,
          rating,
          title: title || null,
          comment: comment || null,
        });
        toast({
          title: "Review Updated",
          description: "Your review has been updated successfully.",
        });
      } else {
        await createReview.mutateAsync({
          business_id: businessId,
          rating,
          title: title || undefined,
          comment: comment || undefined,
        });
        toast({
          title: "Review Submitted",
          description: "Thank you for your review!",
        });
      }
      
      onSuccess?.();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit review. Please try again.",
        variant: "destructive",
      });
    }
  };

  const isLoading = createReview.isPending || updateReview.isPending;

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white">
          {existingReview ? 'Edit Review' : 'Write a Review'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Rating
            </label>
            <div className="flex gap-1">
              {Array.from({ length: 5 }, (_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setRating(i + 1)}
                  onMouseEnter={() => setHoveredRating(i + 1)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="p-1 hover:scale-110 transition-transform"
                >
                  <Star
                    className={`w-8 h-8 ${
                      i < (hoveredRating || rating)
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-400'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Title (Optional)
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Brief summary of your experience"
              className="bg-gray-700 border-gray-600 text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Comment (Optional)
            </label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience with this business..."
              rows={4}
              className="bg-gray-700 border-gray-600 text-white"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={isLoading || rating === 0}
              className="bg-[#00C2FF] hover:bg-[#00A8D8]"
            >
              {isLoading ? 'Submitting...' : existingReview ? 'Update Review' : 'Submit Review'}
            </Button>
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ReviewForm;
