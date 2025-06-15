
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export const useEvents = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          event_rsvps!inner(count)
        `)
        .eq('status', 'active')
        .order('event_date', { ascending: true });
      
      if (error) throw error;
      
      // Add attendee count for each event
      const eventsWithAttendees = await Promise.all(
        (data || []).map(async (event) => {
          const { count } = await supabase
            .from('event_rsvps')
            .select('*', { count: 'exact', head: true })
            .eq('event_id', event.id)
            .eq('status', 'going');
          
          return {
            ...event,
            attendee_count: count || 0
          };
        })
      );
      
      return eventsWithAttendees;
    }
  });

  return {
    data: data || [],
    isLoading,
    error,
    events: data || [],
    eventsLoading: isLoading
  };
};

export const useMyEvents = () => {
  const { user } = useAuth();
  
  const { data: myEvents, isLoading, error } = useQuery({
    queryKey: ['my-events', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('created_by', user.id)
        .order('event_date', { ascending: true });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id
  });

  return {
    data: myEvents || [],
    isLoading,
    error
  };
};

export const useCreateEvent = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const mutation = useMutation({
    mutationFn: async (eventData: any) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('events')
        .insert([{
          ...eventData,
          created_by: user.id
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['my-events'] });
    }
  });

  return {
    createEventAsync: mutation.mutateAsync,
    isCreatingEvent: mutation.isPending,
    ...mutation
  };
};

export const useDeleteEvent = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (eventId: string) => {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['my-events'] });
    }
  });

  return {
    deleteEvent: mutation.mutate,
    isDeletingEvent: mutation.isPending,
    ...mutation
  };
};

export const useUpdateRSVP = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const mutation = useMutation({
    mutationFn: async ({ eventId, status }: { eventId: string; status: string }) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('event_rsvps')
        .upsert([{
          event_id: eventId,
          user_id: user.id,
          status: status
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    }
  });

  return {
    updateRSVP: mutation.mutate,
    isUpdatingRSVP: mutation.isPending,
    ...mutation
  };
};
