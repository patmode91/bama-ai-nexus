
import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface AnalyticsEvent {
  id: string;
  event_type: string;
  business_id: number | null;
  user_id: string | null;
  metadata: any;
  created_at: string;
}

export const useAnalytics = (dateRange?: { from: Date; to: Date }) => {
  return useQuery({
    queryKey: ['analytics', dateRange],
    queryFn: async () => {
      let query = supabase
        .from('analytics_events')
        .select('*')
        .order('created_at', { ascending: false });

      if (dateRange) {
        query = query
          .gte('created_at', dateRange.from.toISOString())
          .lte('created_at', dateRange.to.toISOString());
      }

      const { data, error } = await query;
      if (error) throw error;

      // Calculate analytics summary
      const events = data || [];
      const eventCounts = events.reduce((acc, event) => {
        acc[event.event_type] = (acc[event.event_type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const businessViews = events
        .filter(e => e.event_type === 'business_view' && e.business_id)
        .reduce((acc, event) => {
          acc[event.business_id!] = (acc[event.business_id!] || 0) + 1;
          return acc;
        }, {} as Record<number, number>);

      return {
        events,
        eventCounts,
        businessViews,
        totalEvents: events.length,
        uniqueUsers: [...new Set(events.map(e => e.user_id).filter(Boolean))].length,
      };
    },
  });
};

export const useTrackEvent = () => {
  return useMutation({
    mutationFn: async (event: {
      event_type: string;
      business_id?: number;
      metadata?: any;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('analytics_events')
        .insert({
          ...event,
          user_id: user?.id || null,
        });

      if (error) throw error;
    },
  });
};
