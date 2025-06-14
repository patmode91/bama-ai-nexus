
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Business } from '@/hooks/useBusinesses';

export const useSavedBusinesses = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    data: savedBusinesses,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['savedBusinesses'],
    queryFn: async (): Promise<Business[]> => {
      console.log('Fetching saved businesses...');
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      // First get the business IDs that are saved by this user
      const { data: savedIds, error: savedError } = await supabase
        .rpc('get_saved_business_ids', { user_id: user.id });

      if (savedError) {
        console.error('Error fetching saved business IDs:', savedError);
        // If the function doesn't exist, fall back to empty array
        return [];
      }

      if (!savedIds || savedIds.length === 0) return [];

      // Then fetch the actual business data
      const { data: businesses, error: businessError } = await supabase
        .from('businesses')
        .select('*')
        .in('id', savedIds);

      if (businessError) {
        console.error('Error fetching saved businesses:', businessError);
        throw businessError;
      }

      console.log('Saved businesses fetched:', businesses);
      return businesses || [];
    },
  });

  const saveBusinessMutation = useMutation({
    mutationFn: async (businessId: number) => {
      console.log('Saving business:', businessId);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      // Use RPC function to handle the insert
      const { error } = await supabase.rpc('save_business', {
        user_id: user.id,
        business_id: businessId
      });

      if (error) throw error;
      return businessId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savedBusinesses'] });
      toast({
        title: "Business saved",
        description: "Business has been added to your saved list.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const unsaveBusinessMutation = useMutation({
    mutationFn: async (businessId: number) => {
      console.log('Unsaving business:', businessId);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      // Use RPC function to handle the delete
      const { error } = await supabase.rpc('unsave_business', {
        user_id: user.id,
        business_id: businessId
      });

      if (error) throw error;
      return businessId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savedBusinesses'] });
      toast({
        title: "Business removed",
        description: "Business has been removed from your saved list.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const isBusinessSaved = (businessId: number) => {
    return savedBusinesses?.some(business => business.id === businessId) || false;
  };

  return {
    savedBusinesses,
    isLoading,
    error,
    saveBusiness: saveBusinessMutation.mutate,
    unsaveBusiness: unsaveBusinessMutation.mutate,
    isBusinessSaved,
    isSaving: saveBusinessMutation.isPending,
    isUnsaving: unsaveBusinessMutation.isPending,
  };
};
