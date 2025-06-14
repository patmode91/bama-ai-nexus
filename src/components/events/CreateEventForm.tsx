
import { useState } from 'react';
import { X, Calendar, MapPin, Users, Type, FileText, Tag, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useCreateEvent } from '@/hooks/useEvents';
import { CreateEventData } from '@/types/events';

interface CreateEventFormProps {
  onClose: () => void;
}

const CreateEventForm = ({ onClose }: CreateEventFormProps) => {
  const { createEventAsync, isCreatingEvent } = useCreateEvent();
  const [formData, setFormData] = useState<Partial<CreateEventData>>({
    title: '',
    description: '',
    event_date: '',
    end_date: '',
    location: '',
    venue_name: '',
    event_type: 'meetup',
    is_virtual: false,
    meeting_url: '',
    max_attendees: undefined,
    tags: [],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (!formData.title || !formData.event_date) {
        throw new Error('Title and event date are required');
      }

      await createEventAsync({
        title: formData.title,
        description: formData.description || '',
        event_date: formData.event_date,
        end_date: formData.end_date,
        location: formData.location,
        venue_name: formData.venue_name,
        event_type: formData.event_type || 'meetup',
        is_virtual: formData.is_virtual || false,
        meeting_url: formData.meeting_url,
        max_attendees: formData.max_attendees,
        tags: formData.tags || [],
      });
      
      onClose();
    } catch (error) {
      console.error('Error creating event:', error);
    }
  };

  const handleTagsChange = (value: string) => {
    const tags = value.split(',').map(tag => tag.trim()).filter(Boolean);
    setFormData(prev => ({ ...prev, tags }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-gray-800 border-gray-700">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-white">Create New Event</CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="title" className="text-white flex items-center gap-2">
                  <Type className="w-4 h-4" />
                  Event Title *
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Alabama AI Innovation Summit"
                  className="bg-gray-700 border-gray-600 text-white"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description" className="text-white flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Join us for an exciting day of AI innovations, networking, and learning..."
                  className="bg-gray-700 border-gray-600 text-white min-h-[100px]"
                />
              </div>

              <div>
                <Label htmlFor="event_type" className="text-white">Event Type</Label>
                <Select
                  value={formData.event_type}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, event_type: value }))}
                >
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                    <SelectValue placeholder="Select event type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="meetup">Meetup</SelectItem>
                    <SelectItem value="workshop">Workshop</SelectItem>
                    <SelectItem value="conference">Conference</SelectItem>
                    <SelectItem value="networking">Networking</SelectItem>
                    <SelectItem value="webinar">Webinar</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Date and Time */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="event_date" className="text-white flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Start Date & Time *
                </Label>
                <Input
                  id="event_date"
                  type="datetime-local"
                  value={formData.event_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, event_date: e.target.value }))}
                  className="bg-gray-700 border-gray-600 text-white"
                  required
                />
              </div>

              <div>
                <Label htmlFor="end_date" className="text-white flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  End Date & Time
                </Label>
                <Input
                  id="end_date"
                  type="datetime-local"
                  value={formData.end_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
            </div>

            {/* Virtual Event Toggle */}
            <div className="flex items-center space-x-2">
              <Switch
                id="is_virtual"
                checked={formData.is_virtual}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_virtual: checked }))}
              />
              <Label htmlFor="is_virtual" className="text-white">Virtual Event</Label>
            </div>

            {/* Location/Virtual Details */}
            <div className="space-y-4">
              {formData.is_virtual ? (
                <div>
                  <Label htmlFor="meeting_url" className="text-white">Meeting URL</Label>
                  <Input
                    id="meeting_url"
                    value={formData.meeting_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, meeting_url: e.target.value }))}
                    placeholder="https://zoom.us/j/..."
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="venue_name" className="text-white">Venue Name</Label>
                    <Input
                      id="venue_name"
                      value={formData.venue_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, venue_name: e.target.value }))}
                      placeholder="Innovation Hub Birmingham"
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>

                  <div>
                    <Label htmlFor="location" className="text-white flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Location
                    </Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="Birmingham, AL"
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Additional Details */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="max_attendees" className="text-white flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Max Attendees
                </Label>
                <Input
                  id="max_attendees"
                  type="number"
                  value={formData.max_attendees || ''}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    max_attendees: e.target.value ? parseInt(e.target.value) : undefined 
                  }))}
                  placeholder="100"
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>

              <div>
                <Label htmlFor="tags" className="text-white flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  Tags (comma-separated)
                </Label>
                <Input
                  id="tags"
                  value={formData.tags?.join(', ') || ''}
                  onChange={(e) => handleTagsChange(e.target.value)}
                  placeholder="AI, Machine Learning, Networking"
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1 border-gray-600"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isCreatingEvent}
                className="flex-1 bg-[#00C2FF] hover:bg-[#00A8D8]"
              >
                {isCreatingEvent ? 'Creating...' : 'Create Event'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateEventForm;
