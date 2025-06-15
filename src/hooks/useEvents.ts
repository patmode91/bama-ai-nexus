
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

// Define proper event types
interface Event {
  id: string;
  title: string;
  description: string;
  event_date: string;
  end_date: string;
  location: string;
  venue_name: string;
  event_type: 'meetup' | 'workshop' | 'conference' | 'networking';
  status: 'active' | 'cancelled' | 'completed';
  is_virtual: boolean;
  meeting_url: string;
  max_attendees: number;
  featured_image: string;
  tags: string[];
  business_id: number;
  created_by: string;
  created_at: string;
  updated_at: string;
}

interface EventWithAttendees extends Event {
  attendee_count: number;
}

export const useEvents = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      // Use a single JOIN query instead of multiple requests
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          attendee_count:event_rsvps!inner(count)
        `)
        .eq('status', 'active')
        .eq('event_rsvps.status', 'going')
        .order('event_date', { ascending: true });
      
      if (error) throw error;
      
      // Transform the data to include attendee_count
      const eventsWithAttendees = (data || []).map(event => ({
        ...event,
        attendee_count: event.attendee_count?.[0]?.count || 0
      })) as EventWithAttendees[];
      
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
    mutate: mutation.mutate,
    mutateAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
    data: mutation.data,
    reset: mutation.reset
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
    mutate: mutation.mutate,
    mutateAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
    data: mutation.data,
    reset: mutation.reset
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
    mutate: mutation.mutate,
    mutateAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    isError: mutation.isError,
    error: mutation.error,
    isSuccess: mutation.isSuccess,
    data: mutation.data,
    reset: mutation.reset
  };
};
