
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Event, EventRSVP, EventWithAttendees, CreateEventData } from '@/types/events';

export const useEvents = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    data: events = [],
    isLoading,
    error,
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
          // Get attendee count
          const { data: attendeeCount } = await supabase
            .rpc('get_event_attendee_count', { event_uuid: event.id });

          // Get user's RSVP if logged in
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
            status: event.status as 'active' | 'cancelled' | 'completed',
            attendee_count: attendeeCount || 0,
            user_rsvp: userRsvp ? {
              ...userRsvp,
              status: userRsvp.status as 'going' | 'maybe' | 'not_going'
            } : undefined,
          };
        })
      );

      console.log('Events fetched:', eventsWithDetails);
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
      return {
        ...data,
        status: data.status as 'active' | 'cancelled' | 'completed'
      };
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
      console.error('Event creation error:', error);
    },
  });

  const rsvpMutation = useMutation({
    mutationFn: async ({ eventId, status }: { eventId: string; status: 'going' | 'maybe' | 'not_going' }) => {
      console.log('RSVP to event:', eventId, status);
      
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
      return {
        ...data,
        status: data.status as 'going' | 'maybe' | 'not_going'
      };
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
      console.error('RSVP error:', error);
    },
  });

  const {
    data: userEvents = [],
    isLoading: userEventsLoading,
  } = useQuery({
    queryKey: ['user-events'],
    queryFn: async (): Promise<Event[]> => {
      console.log('Fetching user events...');
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('created_by', user.id)
        .order('event_date', { ascending: true });

      if (error) {
        console.error('Error fetching user events:', error);
        throw error;
      }

      const typedEvents = data.map(event => ({
        ...event,
        status: event.status as 'active' | 'cancelled' | 'completed'
      }));

      console.log('User events fetched:', typedEvents);
      return typedEvents;
    },
    enabled: true,
  });

  return {
    events,
    userEvents,
    isLoading,
    userEventsLoading,
    error,
    createEvent: createEventMutation.mutate,
    isCreating: createEventMutation.isPending,
    rsvp: rsvpMutation.mutate,
    isRsvping: rsvpMutation.isPending,
  };
};
