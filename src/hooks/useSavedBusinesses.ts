
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

      const { data, error } = await supabase
        .from('saved_businesses')
        .select(`
          business_id,
          businesses (*)
        `)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching saved businesses:', error);
        throw error;
      }

      const businesses = data?.map(item => item.businesses).filter(Boolean) as Business[];
      console.log('Saved businesses fetched:', businesses);
      return businesses || [];
    },
  });

  const saveBusinessMutation = useMutation({
    mutationFn: async (businessId: number) => {
      console.log('Saving business:', businessId);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const { error } = await supabase
        .from('saved_businesses')
        .insert({
          user_id: user.id,
          business_id: businessId,
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

      const { error } = await supabase
        .from('saved_businesses')
        .delete()
        .eq('user_id', user.id)
        .eq('business_id', businessId);

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
