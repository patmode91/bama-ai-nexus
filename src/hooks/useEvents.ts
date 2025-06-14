
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Event, EventRSVP, CreateEventData, EventWithAttendees } from '@/types/events';
import { toast } from 'sonner';

export const useEvents = () => {
  return useQuery({
    queryKey: ['events'],
    queryFn: async (): Promise<EventWithAttendees[]> => {
      console.log('Fetching events...');
      
      const { data: events, error } = await supabase
        .from('events')
        .select(`
          *,
          businesses(businessname, logo_url)
        `)
        .eq('status', 'active')
        .order('event_date', { ascending: true });

      if (error) {
        console.error('Error fetching events:', error);
        throw error;
      }

      // Get attendee counts and user RSVPs for each event
      const eventsWithData = await Promise.all(
        (events || []).map(async (event) => {
          // Get attendee count
          const { data: attendeeCount } = await supabase
            .rpc('get_event_attendee_count', { event_uuid: event.id });

          // Get current user's RSVP
          const { data: userRSVP } = await supabase
            .from('event_rsvps')
            .select('*')
            .eq('event_id', event.id)
            .eq('user_id', (await supabase.auth.getUser()).data.user?.id || '')
            .single();

          return {
            ...event,
            attendee_count: attendeeCount || 0,
            user_rsvp: userRSVP || undefined
          };
        })
      );

      console.log('Fetched events with data:', eventsWithData);
      return eventsWithData;
    },
    refetchInterval: 60000, // Refetch every minute for real-time updates
  });
};

export const useCreateEvent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (eventData: CreateEventData): Promise<Event> => {
      console.log('Creating event:', eventData);
      
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        throw new Error('User must be authenticated to create events');
      }

      const { data, error } = await supabase
        .from('events')
        .insert({
          ...eventData,
          created_by: user.user.id
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating event:', error);
        throw error;
      }

      console.log('Created event:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast.success('Event created successfully!');
    },
    onError: (error) => {
      console.error('Failed to create event:', error);
      toast.error('Failed to create event. Please try again.');
    },
  });
};

export const useUpdateRSVP = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ eventId, status }: { eventId: string; status: 'going' | 'maybe' | 'not_going' }): Promise<EventRSVP> => {
      console.log('Updating RSVP:', { eventId, status });
      
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        throw new Error('User must be authenticated to RSVP');
      }

      const { data, error } = await supabase
        .from('event_rsvps')
        .upsert({
          event_id: eventId,
          user_id: user.user.id,
          status: status
        })
        .select()
        .single();

      if (error) {
        console.error('Error updating RSVP:', error);
        throw error;
      }

      console.log('Updated RSVP:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast.success('RSVP updated successfully!');
    },
    onError: (error) => {
      console.error('Failed to update RSVP:', error);
      toast.error('Failed to update RSVP. Please try again.');
    },
  });
};

export const useMyEvents = () => {
  return useQuery({
    queryKey: ['my-events'],
    queryFn: async (): Promise<Event[]> => {
      console.log('Fetching user events...');
      
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        return [];
      }

      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('created_by', user.user.id)
        .order('event_date', { ascending: true });

      if (error) {
        console.error('Error fetching user events:', error);
        throw error;
      }

      console.log('Fetched user events:', data);
      return data || [];
    },
  });
};
