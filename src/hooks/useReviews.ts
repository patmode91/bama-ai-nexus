
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Review {
  id: string;
  user_id: string;
  business_id: number;
  rating: number;
  title: string | null;
  comment: string | null;
  created_at: string;
  updated_at: string;
}

export const useBusinessReviews = (businessId: number) => {
  return useQuery({
    queryKey: ['reviews', businessId],
    queryFn: async (): Promise<Review[]> => {
      console.log('Fetching reviews for business:', businessId);
      
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('business_id', businessId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching reviews:', error);
        throw error;
      }

      return data || [];
    },
  });
};

export const useCreateReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (review: {
      business_id: number;
      rating: number;
      title?: string;
      comment?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('reviews')
        .insert({
          ...review,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['reviews', variables.business_id] });
      queryClient.invalidateQueries({ queryKey: ['businesses'] });
    },
  });
};

export const useUpdateReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Review> & { id: string }) => {
      const { data, error } = await supabase
        .from('reviews')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['reviews', data.business_id] });
      queryClient.invalidateQueries({ queryKey: ['businesses'] });
    },
  });
};

export const useDeleteReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      queryClient.invalidateQueries({ queryKey: ['businesses'] });
    },
  });
};
