
-- Create events table
CREATE TABLE public.events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  event_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE,
  location TEXT,
  venue_name TEXT,
  max_attendees INTEGER,
  created_by UUID REFERENCES auth.users NOT NULL,
  business_id BIGINT REFERENCES public.businesses,
  event_type TEXT DEFAULT 'meetup',
  is_virtual BOOLEAN DEFAULT false,
  meeting_url TEXT,
  tags TEXT[],
  featured_image TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'completed'))
);

-- Create event RSVPs table
CREATE TABLE public.event_rsvps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES public.events ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users NOT NULL,
  status TEXT DEFAULT 'going' CHECK (status IN ('going', 'maybe', 'not_going')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(event_id, user_id)
);

-- Enable Row Level Security
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_rsvps ENABLE ROW LEVEL SECURITY;

-- RLS policies for events (public read, authenticated create/update own)
CREATE POLICY "Anyone can view active events" 
  ON public.events 
  FOR SELECT 
  USING (status = 'active');

CREATE POLICY "Authenticated users can create events" 
  ON public.events 
  FOR INSERT 
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own events" 
  ON public.events 
  FOR UPDATE 
  USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own events" 
  ON public.events 
  FOR DELETE 
  USING (auth.uid() = created_by);

-- RLS policies for RSVPs
CREATE POLICY "Anyone can view RSVPs" 
  ON public.event_rsvps 
  FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can RSVP" 
  ON public.event_rsvps 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own RSVPs" 
  ON public.event_rsvps 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own RSVPs" 
  ON public.event_rsvps 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create function to get event attendee count
CREATE OR REPLACE FUNCTION get_event_attendee_count(event_uuid UUID)
RETURNS INTEGER
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT COUNT(*)::INTEGER
  FROM public.event_rsvps 
  WHERE event_id = event_uuid AND status = 'going';
$$;
