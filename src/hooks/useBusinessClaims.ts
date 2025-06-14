
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface BusinessClaim {
  id: string;
  business_id: number;
  user_id: string;
  status: 'pending' | 'approved' | 'rejected';
  claim_type: 'ownership' | 'management';
  supporting_documents: any;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}

export const useBusinessClaims = () => {
  return useQuery({
    queryKey: ['business-claims'],
    queryFn: async (): Promise<BusinessClaim[]> => {
      console.log('Fetching business claims...');
      
      const { data, error } = await supabase
        .from('business_claims')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching business claims:', error);
        throw error;
      }

      console.log('Fetched business claims:', data);
      return data || [];
    },
  });
};

export const useCreateBusinessClaim = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (claimData: {
      business_id: number;
      claim_type: 'ownership' | 'management';
      supporting_documents?: any;
    }) => {
      console.log('Creating business claim:', claimData);
      
      const { data, error } = await supabase
        .from('business_claims')
        .insert([claimData])
        .select()
        .single();

      if (error) {
        console.error('Error creating business claim:', error);
        throw error;
      }

      console.log('Created business claim:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business-claims'] });
    },
  });
};

export const useOwnedBusinesses = () => {
  return useQuery({
    queryKey: ['owned-businesses'],
    queryFn: async () => {
      console.log('Fetching owned businesses...');
      
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('owner_id', user.user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching owned businesses:', error);
        throw error;
      }

      console.log('Fetched owned businesses:', data);
      return data || [];
    },
  });
};
