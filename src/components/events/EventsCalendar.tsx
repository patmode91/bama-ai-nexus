
import { useState } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EventWithAttendees } from '@/types/events';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

interface EventsCalendarProps {
  events: EventWithAttendees[];
  onDateSelect?: (date: Date) => void;
}

const EventsCalendar = ({ events, onDateSelect }: EventsCalendarProps) => {
  const [selectedEvent, setSelectedEvent] = useState<EventWithAttendees | null>(null);

  const calendarEvents = events.map(event => ({
    id: event.id,
    title: event.title,
    start: new Date(event.event_date),
    end: event.end_date ? new Date(event.end_date) : new Date(event.event_date),
    resource: event,
  }));

  const handleSelectEvent = (event: any) => {
    setSelectedEvent(event.resource);
  };

  const handleSelectSlot = ({ start }: { start: Date }) => {
    if (onDateSelect) {
      onDateSelect(start);
    }
  };

  return (
    <div className="space-y-6">
      <div className="h-96 bg-white rounded-lg p-4">
        <Calendar
          localizer={localizer}
          events={calendarEvents}
          startAccessor="start"
          endAccessor="end"
          onSelectEvent={handleSelectEvent}
          onSelectSlot={handleSelectSlot}
          selectable
          views={['month', 'week', 'day']}
          defaultView="month"
          style={{ height: '100%' }}
          eventPropGetter={() => ({
            style: {
              backgroundColor: '#00C2FF',
              borderColor: '#00A8D8',
            },
          })}
        />
      </div>

      {selectedEvent && (
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <div className="flex items-start justify-between">
              <CardTitle className="text-white">{selectedEvent.title}</CardTitle>
              <Badge variant="secondary" className="bg-[#00C2FF]/20 text-[#00C2FF]">
                {selectedEvent.event_type}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 text-gray-300">
            <p>{selectedEvent.description}</p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">
                {format(new Date(selectedEvent.event_date), 'PPp')}
              </Badge>
              {selectedEvent.location && (
                <Badge variant="outline">{selectedEvent.location}</Badge>
              )}
              <Badge variant="outline">
                {selectedEvent.attendee_count || 0} attending
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EventsCalendar;
