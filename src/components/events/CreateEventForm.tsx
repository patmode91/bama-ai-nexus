
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock, MapPin, Users, Link as LinkIcon } from 'lucide-react';
import { useCreateEvent } from '@/hooks/useEvents';
import { CreateEventData } from '@/types/events';

interface CreateEventFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const CreateEventForm = ({ onSuccess, onCancel }: CreateEventFormProps) => {
  const createEvent = useCreateEvent();
  const [formData, setFormData] = useState<CreateEventData>({
    title: '',
    description: '',
    event_date: '',
    end_date: '',
    location: '',
    venue_name: '',
    max_attendees: undefined,
    event_type: 'meetup',
    is_virtual: false,
    meeting_url: '',
    tags: [],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const eventData: CreateEventData = {
      ...formData,
      max_attendees: formData.max_attendees || undefined,
      tags: formData.tags?.filter(tag => tag.trim()) || [],
    };

    try {
      await createEvent.mutateAsync(eventData);
      onSuccess?.();
    } catch (error) {
      console.error('Failed to create event:', error);
    }
  };

  const handleTagsChange = (tagsString: string) => {
    const tags = tagsString.split(',').map(tag => tag.trim()).filter(Boolean);
    setFormData({ ...formData, tags });
  };

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white">Create New Event</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-white">Event Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="AI Networking Meetup"
              required
              className="bg-gray-700 border-gray-600 text-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-white">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe your event..."
              rows={3}
              className="bg-gray-700 border-gray-600 text-white resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="event_date" className="text-white flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Start Date & Time *
              </Label>
              <Input
                id="event_date"
                type="datetime-local"
                value={formData.event_date}
                onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                required
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="end_date" className="text-white flex items-center gap-1">
                <Clock className="w-4 h-4" />
                End Date & Time
              </Label>
              <Input
                id="end_date"
                type="datetime-local"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="event_type" className="text-white">Event Type</Label>
            <Select
              value={formData.event_type}
              onValueChange={(value) => setFormData({ ...formData, event_type: value })}
            >
              <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                <SelectValue placeholder="Select event type" />
              </SelectTrigger>
              <SelectContent className="bg-gray-700 border-gray-600">
                <SelectItem value="meetup">Meetup</SelectItem>
                <SelectItem value="workshop">Workshop</SelectItem>
                <SelectItem value="networking">Networking</SelectItem>
                <SelectItem value="conference">Conference</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_virtual"
              checked={formData.is_virtual}
              onCheckedChange={(checked) => setFormData({ ...formData, is_virtual: checked })}
            />
            <Label htmlFor="is_virtual" className="text-white">Virtual Event</Label>
          </div>

          {formData.is_virtual && (
            <div className="space-y-2">
              <Label htmlFor="meeting_url" className="text-white flex items-center gap-1">
                <LinkIcon className="w-4 h-4" />
                Meeting URL
              </Label>
              <Input
                id="meeting_url"
                type="url"
                value={formData.meeting_url}
                onChange={(e) => setFormData({ ...formData, meeting_url: e.target.value })}
                placeholder="https://zoom.us/j/..."
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>
          )}

          {!formData.is_virtual && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="venue_name" className="text-white">Venue Name</Label>
                <Input
                  id="venue_name"
                  value={formData.venue_name}
                  onChange={(e) => setFormData({ ...formData, venue_name: e.target.value })}
                  placeholder="Innovation Hub"
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location" className="text-white flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  Location
                </Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Birmingham, AL"
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="max_attendees" className="text-white flex items-center gap-1">
              <Users className="w-4 h-4" />
              Max Attendees
            </Label>
            <Input
              id="max_attendees"
              type="number"
              value={formData.max_attendees || ''}
              onChange={(e) => setFormData({ ...formData, max_attendees: e.target.value ? parseInt(e.target.value) : undefined })}
              placeholder="50"
              min="1"
              className="bg-gray-700 border-gray-600 text-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags" className="text-white">Tags</Label>
            <Input
              id="tags"
              value={formData.tags?.join(', ') || ''}
              onChange={(e) => handleTagsChange(e.target.value)}
              placeholder="AI, Machine Learning, Networking (comma separated)"
              className="bg-gray-700 border-gray-600 text-white"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={createEvent.isPending}
              className="bg-[#00C2FF] hover:bg-[#0099CC] text-white flex-1"
            >
              {createEvent.isPending ? 'Creating...' : 'Create Event'}
            </Button>
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default CreateEventForm;
