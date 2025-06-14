
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Calendar, Users, Clock } from 'lucide-react';
import Header from '@/components/sections/Header';
import Footer from '@/components/sections/Footer';
import SEO from '@/components/seo/SEO';
import EventCard from '@/components/events/EventCard';
import EventsCalendar from '@/components/events/EventsCalendar';
import CreateEventForm from '@/components/events/CreateEventForm';
import { useEvents, useMyEvents } from '@/hooks/useEvents';
import { EventWithAttendees } from '@/types/events';

const Events = () => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventWithAttendees | null>(null);
  const { data: events = [], isLoading: eventsLoading, error: eventsError } = useEvents();
  const { data: myEvents = [], isLoading: myEventsLoading } = useMyEvents();

  const upcomingEvents = events.filter(event => 
    new Date(event.event_date) > new Date()
  );

  const pastEvents = events.filter(event => 
    new Date(event.event_date) <= new Date()
  );

  const handleCreateSuccess = () => {
    setShowCreateDialog(false);
  };

  const handleDateSelect = (date: Date, dayEvents: EventWithAttendees[]) => {
    console.log('Selected date:', date, 'Events:', dayEvents);
  };

  const handleViewDetails = (event: EventWithAttendees) => {
    setSelectedEvent(event);
  };

  if (eventsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-700 to-gray-800">
        <Header />
        <div className="container mx-auto px-6 py-8">
          <div className="text-center text-white">Loading events...</div>
        </div>
      </div>
    );
  }

  if (eventsError) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-700 to-gray-800">
        <Header />
        <div className="container mx-auto px-6 py-8">
          <div className="text-center text-red-400">Error loading events. Please try again.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-700 to-gray-800">
      <SEO 
        title="Events & Meetups"
        description="Discover AI events, workshops, and networking opportunities in Alabama. Connect with the local AI community."
      />
      
      <Header />

      <main className="container mx-auto px-6 py-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Events & Meetups
            </h1>
            <p className="text-gray-400">
              Connect with Alabama's AI community through events, workshops, and networking opportunities.
            </p>
          </div>
          
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="bg-[#00C2FF] hover:bg-[#0099CC] text-white">
                <Plus className="w-4 h-4 mr-2" />
                Create Event
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl bg-gray-900 border-gray-700">
              <DialogHeader>
                <DialogTitle className="text-white">Create New Event</DialogTitle>
              </DialogHeader>
              <CreateEventForm 
                onSuccess={handleCreateSuccess}
                onCancel={() => setShowCreateDialog(false)}
              />
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Calendar className="w-8 h-8 text-[#00C2FF]" />
                <div>
                  <p className="text-2xl font-bold text-white">{upcomingEvents.length}</p>
                  <p className="text-gray-400">Upcoming Events</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Users className="w-8 h-8 text-[#00C2FF]" />
                <div>
                  <p className="text-2xl font-bold text-white">
                    {events.reduce((sum, event) => sum + (event.attendee_count || 0), 0)}
                  </p>
                  <p className="text-gray-400">Total RSVPs</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Clock className="w-8 h-8 text-[#00C2FF]" />
                <div>
                  <p className="text-2xl font-bold text-white">{myEvents.length}</p>
                  <p className="text-gray-400">Your Events</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="upcoming" className="space-y-6">
          <TabsList className="bg-gray-800 border-gray-700">
            <TabsTrigger value="upcoming" className="data-[state=active]:bg-[#00C2FF]">
              Upcoming Events
            </TabsTrigger>
            <TabsTrigger value="calendar" className="data-[state=active]:bg-[#00C2FF]">
              Calendar View
            </TabsTrigger>
            <TabsTrigger value="past" className="data-[state=active]:bg-[#00C2FF]">
              Past Events
            </TabsTrigger>
            <TabsTrigger value="my-events" className="data-[state=active]:bg-[#00C2FF]">
              My Events
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-6">
            {upcomingEvents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {upcomingEvents.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onViewDetails={handleViewDetails}
                  />
                ))}
              </div>
            ) : (
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-8 text-center">
                  <Calendar className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">No Upcoming Events</h3>
                  <p className="text-gray-400 mb-4">
                    Be the first to create an event for the Alabama AI community!
                  </p>
                  <Button 
                    onClick={() => setShowCreateDialog(true)}
                    className="bg-[#00C2FF] hover:bg-[#0099CC] text-white"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Event
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="calendar" className="space-y-6">
            <EventsCalendar events={events} onDateSelect={handleDateSelect} />
          </TabsContent>

          <TabsContent value="past" className="space-y-6">
            {pastEvents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pastEvents.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onViewDetails={handleViewDetails}
                  />
                ))}
              </div>
            ) : (
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-8 text-center">
                  <Clock className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">No Past Events</h3>
                  <p className="text-gray-400">Past events will appear here.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="my-events" className="space-y-6">
            {!myEventsLoading && myEvents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myEvents.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    onViewDetails={handleViewDetails}
                  />
                ))}
              </div>
            ) : (
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-8 text-center">
                  <Users className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">No Events Created</h3>
                  <p className="text-gray-400 mb-4">
                    Create your first event to get started organizing meetups.
                  </p>
                  <Button 
                    onClick={() => setShowCreateDialog(true)}
                    className="bg-[#00C2FF] hover:bg-[#0099CC] text-white"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Event
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>

      <Footer />

      {/* Event Details Dialog */}
      {selectedEvent && (
        <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
          <DialogContent className="max-w-2xl bg-gray-900 border-gray-700">
            <DialogHeader>
              <DialogTitle className="text-white">{selectedEvent.title}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-gray-300">{selectedEvent.description}</p>
              {/* Add more event details here */}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default Events;
