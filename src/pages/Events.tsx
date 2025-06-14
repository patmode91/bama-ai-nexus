
import { useState } from 'react';
import { Calendar, Plus, Users, MapPin, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Header from '@/components/sections/Header';
import Footer from '@/components/sections/Footer';
import EventCard from '@/components/events/EventCard';
import CreateEventForm from '@/components/events/CreateEventForm';
import EventsCalendar from '@/components/events/EventsCalendar';
import { useEvents } from '@/hooks/useEvents';

const Events = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const { events, eventsLoading } = useEvents();

  const upcomingEvents = events.filter(event => 
    new Date(event.event_date) > new Date()
  );

  const pastEvents = events.filter(event => 
    new Date(event.event_date) <= new Date()
  );

  if (eventsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-700 to-gray-800">
        <Header />
        <div className="container mx-auto px-6 py-16">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-700 rounded w-1/3"></div>
            <div className="h-4 bg-gray-700 rounded w-2/3"></div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 bg-gray-700 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-700 to-gray-800">
      <Header />
      
      <div className="container mx-auto px-6 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            AI Events & Meetups
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
            Connect with Alabama's AI community through workshops, conferences, and networking events
          </p>
          <Button 
            onClick={() => setShowCreateForm(true)}
            className="bg-[#00C2FF] hover:bg-[#00A8D8]"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Event
          </Button>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6 text-center">
              <Calendar className="w-8 h-8 text-[#00C2FF] mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{upcomingEvents.length}</div>
              <div className="text-gray-400">Upcoming Events</div>
            </CardContent>
          </Card>
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6 text-center">
              <Users className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">
                {events.reduce((sum, event) => sum + (event.attendee_count || 0), 0)}
              </div>
              <div className="text-gray-400">Total RSVPs</div>
            </CardContent>
          </Card>
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6 text-center">
              <MapPin className="w-8 h-8 text-purple-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">
                {new Set(events.map(e => e.location?.split(',')[0])).size}
              </div>
              <div className="text-gray-400">Cities</div>
            </CardContent>
          </Card>
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-6 text-center">
              <Clock className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{pastEvents.length}</div>
              <div className="text-gray-400">Past Events</div>
            </CardContent>
          </Card>
        </div>

        {/* Events Content */}
        <Tabs defaultValue="grid" className="space-y-6">
          <TabsList className="bg-gray-800">
            <TabsTrigger value="grid">Grid View</TabsTrigger>
            <TabsTrigger value="calendar">Calendar View</TabsTrigger>
          </TabsList>

          <TabsContent value="grid" className="space-y-6">
            {/* Upcoming Events */}
            <section>
              <h2 className="text-2xl font-bold text-white mb-6">Upcoming Events</h2>
              {upcomingEvents.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {upcomingEvents.map((event) => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>
              ) : (
                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="p-12 text-center">
                    <Calendar className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">No Upcoming Events</h3>
                    <p className="text-gray-400 mb-4">Be the first to create an event for the community!</p>
                    <Button onClick={() => setShowCreateForm(true)}>
                      Create First Event
                    </Button>
                  </CardContent>
                </Card>
              )}
            </section>

            {/* Past Events */}
            {pastEvents.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold text-white mb-6">Past Events</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pastEvents.slice(0, 6).map((event) => (
                    <EventCard key={event.id} event={event} isPast />
                  ))}
                </div>
              </section>
            )}
          </TabsContent>

          <TabsContent value="calendar">
            <EventsCalendar events={events} />
          </TabsContent>
        </Tabs>

        {/* Create Event Modal */}
        {showCreateForm && (
          <CreateEventForm onClose={() => setShowCreateForm(false)} />
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Events;
