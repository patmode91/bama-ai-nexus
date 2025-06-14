
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface VerificationRequest {
  id: string;
  business_id: number;
  requested_by: string;
  status: 'pending' | 'approved' | 'rejected';
  documents_url: string[] | null;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}

export const useVerificationRequests = () => {
  return useQuery({
    queryKey: ['verification-requests'],
    queryFn: async (): Promise<VerificationRequest[]> => {
      const { data, error } = await supabase
        .from('verification_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });
};

export const useCreateVerificationRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: {
      business_id: number;
      documents_url?: string[];
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('verification_requests')
        .insert({
          ...request,
          requested_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['verification-requests'] });
    },
  });
};
