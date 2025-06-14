
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { EventWithAttendees, CreateEventData, RSVPData } from '@/types/events';

export const useEvents = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    data: events = [],
    isLoading: eventsLoading,
  } = useQuery({
    queryKey: ['events'],
    queryFn: async (): Promise<EventWithAttendees[]> => {
      console.log('Fetching events...');
      
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          businesses (
            businessname,
            logo_url
          )
        `)
        .eq('status', 'active')
        .order('event_date', { ascending: true });

      if (error) {
        console.error('Error fetching events:', error);
        throw error;
      }

      // Get attendee counts and user RSVPs for each event
      const eventsWithDetails = await Promise.all(
        data.map(async (event) => {
          const { count: attendeeCount } = await supabase
            .from('event_rsvps')
            .select('*', { count: 'exact', head: true })
            .eq('event_id', event.id)
            .eq('status', 'going');

          let userRsvp = null;
          if (user) {
            const { data: rsvp } = await supabase
              .from('event_rsvps')
              .select('*')
              .eq('event_id', event.id)
              .eq('user_id', user.id)
              .single();
            userRsvp = rsvp;
          }

          return {
            ...event,
            attendee_count: attendeeCount || 0,
            user_rsvp: userRsvp,
            status: event.status as 'active' | 'cancelled' | 'completed',
          };
        })
      );

      return eventsWithDetails;
    },
  });

  const createEventMutation = useMutation({
    mutationFn: async (eventData: CreateEventData) => {
      console.log('Creating event:', eventData);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const { data, error } = await supabase
        .from('events')
        .insert({
          ...eventData,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast({
        title: "Event created",
        description: "Your event has been created successfully.",
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

  const updateRSVPMutation = useMutation({
    mutationFn: async ({ eventId, status }: RSVPData) => {
      console.log('Updating RSVP:', { eventId, status });
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const { data, error } = await supabase
        .from('event_rsvps')
        .upsert({
          event_id: eventId,
          user_id: user.id,
          status,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast({
        title: "RSVP updated",
        description: "Your RSVP has been updated successfully.",
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

  return {
    events,
    eventsLoading,
    createEvent: createEventMutation.mutate,
    createEventAsync: createEventMutation.mutateAsync,
    isCreatingEvent: createEventMutation.isPending,
    updateRSVP: updateRSVPMutation.mutate,
    isUpdatingRSVP: updateRSVPMutation.isPending,
  };
};

// Export individual functions for backward compatibility
export const useCreateEvent = () => {
  const { createEvent, createEventAsync, isCreatingEvent } = useEvents();
  return { createEvent, createEventAsync, isCreatingEvent };
};

export const useUpdateRSVP = () => {
  const { updateRSVP, isUpdatingRSVP } = useEvents();
  return { updateRSVP, isUpdatingRSVP };
};
