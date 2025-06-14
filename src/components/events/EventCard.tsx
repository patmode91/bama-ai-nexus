
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, MapPin, Users, Video, Building2 } from 'lucide-react';
import { EventWithAttendees } from '@/types/events';
import { useUpdateRSVP } from '@/hooks/useEvents';

interface EventCardProps {
  event: EventWithAttendees;
  onViewDetails: (event: EventWithAttendees) => void;
}

const EventCard = ({ event, onViewDetails }: EventCardProps) => {
  const updateRSVP = useUpdateRSVP();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getEventTypeColor = () => {
    switch (event.event_type) {
      case 'workshop': return 'bg-blue-400/20 text-blue-400';
      case 'networking': return 'bg-green-400/20 text-green-400';
      case 'conference': return 'bg-purple-400/20 text-purple-400';
      case 'meetup': return 'bg-yellow-400/20 text-yellow-400';
      default: return 'bg-gray-400/20 text-gray-400';
    }
  };

  const getRSVPStatus = () => {
    if (!event.user_rsvp) return null;
    switch (event.user_rsvp.status) {
      case 'going': return 'Going';
      case 'maybe': return 'Maybe';
      case 'not_going': return 'Not Going';
      default: return null;
    }
  };

  const handleRSVP = async (status: 'going' | 'maybe' | 'not_going') => {
    updateRSVP.mutate({ eventId: event.id, status });
  };

  return (
    <Card className="bg-gray-800 border-gray-700 hover:bg-gray-750 transition-colors">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <h3 className="font-semibold text-white line-clamp-2 mb-2">
              {event.title}
            </h3>
            {event.description && (
              <p className="text-gray-400 text-sm line-clamp-2 mb-3">
                {event.description}
              </p>
            )}
          </div>
          {event.featured_image && (
            <div className="w-16 h-16 rounded-lg bg-gray-700 flex-shrink-0 overflow-hidden">
              <img 
                src={event.featured_image} 
                alt={event.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge className={getEventTypeColor()}>
            {event.event_type}
          </Badge>
          {event.is_virtual && (
            <Badge variant="outline" className="text-blue-400">
              <Video className="w-3 h-3 mr-1" />
              Virtual
            </Badge>
          )}
          {getRSVPStatus() && (
            <Badge variant="secondary" className="text-green-400">
              {getRSVPStatus()}
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div className="flex items-center gap-4 text-sm text-gray-400">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(event.event_date)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{formatTime(event.event_date)}</span>
            </div>
          </div>

          {(event.location || event.venue_name) && (
            <div className="flex items-center gap-1 text-sm text-gray-400">
              <MapPin className="w-4 h-4" />
              <span>{event.venue_name || event.location}</span>
            </div>
          )}

          {event.business_id && (
            <div className="flex items-center gap-1 text-sm text-gray-400">
              <Building2 className="w-4 h-4" />
              <span>Hosted by Business</span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-sm text-gray-400">
              <Users className="w-4 h-4" />
              <span>{event.attendee_count || 0} attending</span>
              {event.max_attendees && (
                <span className="text-gray-500">/ {event.max_attendees}</span>
              )}
            </div>

            <div className="flex gap-2">
              {!event.user_rsvp || event.user_rsvp.status !== 'going' ? (
                <Button
                  size="sm"
                  onClick={() => handleRSVP('going')}
                  disabled={updateRSVP.isPending}
                  className="bg-[#00C2FF] hover:bg-[#0099CC] text-white"
                >
                  RSVP
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleRSVP('not_going')}
                  disabled={updateRSVP.isPending}
                  className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
                >
                  Cancel
                </Button>
              )}
              
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onViewDetails(event)}
                className="text-gray-400 hover:text-white"
              >
                Details
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EventCard;
