
import { useState, useEffect } from 'react';
import { Calendar, MapPin, Users, Clock, ExternalLink, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useUpdateRSVP } from '@/hooks/useEvents';
import { supabase } from '@/integrations/supabase/client';
import { EventWithAttendees } from '@/types/events';

interface EventCardProps {
  event: EventWithAttendees;
  isPast?: boolean;
}

const EventCard = ({ event, isPast = false }: EventCardProps) => {
  const [user, setUser] = useState<any>(null);
  const { updateRSVP, isUpdatingRSVP } = useUpdateRSVP();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleRSVP = (status: 'going' | 'maybe' | 'not_going') => {
    if (!user) return;
    updateRSVP({ eventId: event.id, status });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const userRsvpStatus = event.user_rsvp?.status;

  return (
    <Card className={`bg-gray-800 border-gray-700 hover:border-gray-600 transition-colors ${isPast ? 'opacity-75' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-white text-lg mb-2 line-clamp-2">
              {event.title}
            </h3>
            <div className="flex items-center gap-4 text-sm text-gray-400 mb-3">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {formatDate(event.event_date)}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {formatTime(event.event_date)}
              </div>
            </div>
          </div>
          <Badge variant="secondary" className="bg-[#00C2FF]/20 text-[#00C2FF]">
            {event.event_type}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-gray-300 text-sm line-clamp-3">
          {event.description}
        </p>

        <div className="space-y-2">
          {event.location && (
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <MapPin className="w-4 h-4" />
              {event.location}
            </div>
          )}
          
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <Users className="w-4 h-4" />
            {event.attendee_count || 0} attending
            {event.max_attendees && ` • ${event.max_attendees} max`}
          </div>
        </div>

        {event.tags && event.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {event.tags.slice(0, 3).map((tag: string, index: number) => (
              <Badge key={index} variant="outline" className="text-xs border-gray-600 text-gray-400">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {!isPast && (
          <div className="pt-2 border-t border-gray-700">
            {user ? (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={userRsvpStatus === 'going' ? "default" : "outline"}
                  onClick={() => handleRSVP('going')}
                  disabled={isUpdatingRSVP}
                  className="flex-1"
                >
                  Going
                </Button>
                <Button
                  size="sm"
                  variant={userRsvpStatus === 'maybe' ? "default" : "outline"}
                  onClick={() => handleRSVP('maybe')}
                  disabled={isUpdatingRSVP}
                  className="flex-1"
                >
                  Maybe
                </Button>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-gray-400 text-sm mb-2">Sign in to RSVP</p>
                <Button size="sm" variant="outline" className="w-full">
                  <Heart className="w-4 h-4 mr-2" />
                  Interested
                </Button>
              </div>
            )}
          </div>
        )}

        {event.meeting_url && (
          <Button
            variant="outline"
            size="sm"
            className="w-full border-gray-600"
            onClick={() => window.open(event.meeting_url, '_blank')}
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Join Meeting
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default EventCard;
