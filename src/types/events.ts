
export interface Event {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  end_date: string | null;
  location: string | null;
  venue_name: string | null;
  max_attendees: number | null;
  created_by: string;
  business_id: number | null;
  event_type: string;
  is_virtual: boolean;
  meeting_url: string | null;
  tags: string[] | null;
  featured_image: string | null;
  created_at: string;
  updated_at: string;
  status: 'active' | 'cancelled' | 'completed';
}

export interface EventRSVP {
  id: string;
  event_id: string;
  user_id: string;
  status: 'going' | 'maybe' | 'not_going';
  created_at: string;
  updated_at: string;
}

export interface EventWithAttendees extends Event {
  attendee_count?: number;
  user_rsvp?: EventRSVP;
}

export interface CreateEventData {
  title: string;
  description?: string;
  event_date: string;
  end_date?: string;
  location?: string;
  venue_name?: string;
  max_attendees?: number;
  business_id?: number;
  event_type?: string;
  is_virtual?: boolean;
  meeting_url?: string;
  tags?: string[];
  featured_image?: string;
}
