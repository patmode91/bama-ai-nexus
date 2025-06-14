
import React from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useEvents } from '@/hooks/useEvents';

const localizer = momentLocalizer(moment);

interface EventsCalendarProps {
  events?: any[];
  onDateSelect?: (date: Date) => void;
}

const EventsCalendar = ({ events: propEvents, onDateSelect }: EventsCalendarProps) => {
  const { events: hookEvents, eventsLoading } = useEvents();
  
  // Use prop events if provided, otherwise use hook events
  const events = propEvents || hookEvents || [];

  const calendarEvents = events.map(event => ({
    id: event.id,
    title: event.title,
    start: new Date(event.event_date),
    end: event.end_date ? new Date(event.end_date) : new Date(event.event_date),
    resource: event
  }));

  if (eventsLoading && !propEvents) {
    return <div className="p-4 text-center">Loading calendar...</div>;
  }

  return (
    <div className="h-96 p-4">
      <Calendar
        localizer={localizer}
        events={calendarEvents}
        startAccessor="start"
        endAccessor="end"
        style={{ height: '100%' }}
        views={['month', 'week', 'day']}
        defaultView="month"
        onSelectSlot={onDateSelect ? ({ start }) => onDateSelect(start) : undefined}
        selectable={!!onDateSelect}
      />
    </div>
  );
};

export default EventsCalendar;
