
import React from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useEvents } from '@/hooks/useEvents';

const localizer = momentLocalizer(moment);

const EventsCalendar = () => {
  const { data: events = [], isLoading } = useEvents();

  const calendarEvents = events.map(event => ({
    id: event.id,
    title: event.title,
    start: new Date(event.event_date),
    end: event.end_date ? new Date(event.end_date) : new Date(event.event_date),
    resource: event
  }));

  if (isLoading) {
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
      />
    </div>
  );
};

export default EventsCalendar;
