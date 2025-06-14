
import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EventWithAttendees } from '@/types/events';
import { format, isSameDay, parseISO } from 'date-fns';

interface EventsCalendarProps {
  events: EventWithAttendees[];
  onDateSelect: (date: Date, events: EventWithAttendees[]) => void;
}

const EventsCalendar = ({ events, onDateSelect }: EventsCalendarProps) => {
  const [selectedDate, setSelectedDate] = useState<Date>();

  const getEventsForDate = (date: Date) => {
    return events.filter(event => 
      isSameDay(parseISO(event.event_date), date)
    );
  };

  const hasEventsOnDate = (date: Date) => {
    return getEventsForDate(date).length > 0;
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      const dayEvents = getEventsForDate(date);
      onDateSelect(date, dayEvents);
    }
  };

  const selectedDateEvents = selectedDate ? getEventsForDate(selectedDate) : [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Events Calendar</CardTitle>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            className="rounded-md border border-gray-600"
            modifiers={{
              hasEvents: (date) => hasEventsOnDate(date)
            }}
            modifiersStyles={{
              hasEvents: {
                backgroundColor: '#00C2FF',
                color: 'white',
                fontWeight: 'bold'
              }
            }}
          />
          <div className="mt-4 text-sm text-gray-400">
            <p className="flex items-center gap-2">
              <div className="w-3 h-3 bg-[#00C2FF] rounded"></div>
              Days with events
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">
            {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'Select a Date'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {selectedDate ? (
            <div className="space-y-4">
              {selectedDateEvents.length > 0 ? (
                selectedDateEvents.map((event) => (
                  <div
                    key={event.id}
                    className="p-4 bg-gray-700 rounded-lg border border-gray-600"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <h4 className="font-medium text-white mb-2">{event.title}</h4>
                        <p className="text-sm text-gray-400 mb-2">
                          {format(parseISO(event.event_date), 'h:mm a')}
                          {event.end_date && (
                            ` - ${format(parseISO(event.end_date), 'h:mm a')}`
                          )}
                        </p>
                        {event.location && (
                          <p className="text-sm text-gray-400 mb-2">{event.location}</p>
                        )}
                        <div className="flex flex-wrap gap-1">
                          <Badge variant="secondary" className="text-xs">
                            {event.event_type}
                          </Badge>
                          {event.is_virtual && (
                            <Badge variant="outline" className="text-xs text-blue-400">
                              Virtual
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-400">
                          {event.attendee_count || 0} attending
                        </p>
                        {event.user_rsvp && (
                          <Badge 
                            variant="secondary" 
                            className="text-xs mt-1 bg-green-400/20 text-green-400"
                          >
                            {event.user_rsvp.status === 'going' ? 'Going' : 
                             event.user_rsvp.status === 'maybe' ? 'Maybe' : 'Not Going'}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-400 text-center py-8">
                  No events scheduled for this date.
                </p>
              )}
            </div>
          ) : (
            <p className="text-gray-400 text-center py-8">
              Click on a date to see events for that day.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EventsCalendar;
