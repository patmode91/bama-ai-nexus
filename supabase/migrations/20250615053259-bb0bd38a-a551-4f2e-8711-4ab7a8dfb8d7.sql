
-- Enable full-text search capabilities for businesses
-- Add full-text search indexes and functions

-- Create a function to generate search vectors for businesses
CREATE OR REPLACE FUNCTION public.generate_business_search_vector(business_row public.businesses)
RETURNS tsvector
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  RETURN to_tsvector('english', 
    COALESCE(business_row.businessname, '') || ' ' ||
    COALESCE(business_row.description, '') || ' ' ||
    COALESCE(business_row.category, '') || ' ' ||
    COALESCE(business_row.location, '') || ' ' ||
    COALESCE(array_to_string(business_row.tags, ' '), '') || ' ' ||
    COALESCE(array_to_string(business_row.certifications, ' '), '')
  );
END;
$$;

-- Add search vector column to businesses table
ALTER TABLE public.businesses 
ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- Create index for full-text search
CREATE INDEX IF NOT EXISTS businesses_search_vector_idx 
ON public.businesses USING gin(search_vector);

-- Update existing records with search vectors
UPDATE public.businesses 
SET search_vector = generate_business_search_vector(businesses.*);

-- Create trigger to automatically update search vector on changes
CREATE OR REPLACE FUNCTION public.update_business_search_vector()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.search_vector = generate_business_search_vector(NEW);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS update_business_search_vector_trigger ON public.businesses;
CREATE TRIGGER update_business_search_vector_trigger
  BEFORE INSERT OR UPDATE ON public.businesses
  FOR EACH ROW EXECUTE FUNCTION update_business_search_vector();

-- Create search analytics table
CREATE TABLE IF NOT EXISTS public.search_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  search_query TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  results_count INTEGER,
  clicked_business_id BIGINT REFERENCES public.businesses(id),
  session_id TEXT,
  ip_address INET,
  user_agent TEXT,
  search_filters JSONB,
  search_duration_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS for search analytics
ALTER TABLE public.search_analytics ENABLE ROW LEVEL SECURITY;

-- Create policy for search analytics (admins can view all, users can view their own)
CREATE POLICY "Users can view their own search analytics" 
  ON public.search_analytics 
  FOR SELECT 
  USING (auth.uid() = user_id OR auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Anyone can insert search analytics" 
  ON public.search_analytics 
  FOR INSERT 
  WITH CHECK (true);

-- Create search suggestions table
CREATE TABLE IF NOT EXISTS public.search_suggestions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  suggestion TEXT NOT NULL UNIQUE,
  category TEXT,
  popularity_score INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create index for search suggestions
CREATE INDEX IF NOT EXISTS search_suggestions_text_idx 
ON public.search_suggestions USING gin(to_tsvector('english', suggestion));

-- Insert some initial search suggestions
INSERT INTO public.search_suggestions (suggestion, category, popularity_score) VALUES
('technology companies', 'category', 10),
('restaurants', 'category', 15),
('healthcare services', 'category', 8),
('manufacturing', 'category', 6),
('retail stores', 'category', 12),
('professional services', 'category', 9),
('birmingham businesses', 'location', 20),
('huntsville tech', 'location', 15),
('mobile companies', 'location', 10),
('montgomery services', 'location', 8),
('ai companies', 'technology', 25),
('startup companies', 'business_type', 18),
('verified businesses', 'filter', 22)
ON CONFLICT (suggestion) DO NOTHING;

-- Create business updates table for real-time features
CREATE TABLE IF NOT EXISTS public.business_updates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id BIGINT REFERENCES public.businesses(id) ON DELETE CASCADE,
  update_type TEXT NOT NULL CHECK (update_type IN ('listing_update', 'new_review', 'verification', 'hours_change', 'contact_update', 'new_photos')),
  title TEXT NOT NULL,
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS for business updates
ALTER TABLE public.business_updates ENABLE ROW LEVEL SECURITY;

-- Create policy for business updates (public read)
CREATE POLICY "Anyone can view business updates" 
  ON public.business_updates 
  FOR SELECT 
  USING (true);

-- Create policy for business updates (business owners can insert)
CREATE POLICY "Business owners can create updates" 
  ON public.business_updates 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.businesses 
      WHERE id = business_id AND owner_id = auth.uid()
    )
  );

-- Create chat rooms table
CREATE TABLE IF NOT EXISTS public.chat_rooms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  is_private BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  max_members INTEGER DEFAULT 1000,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create chat messages table
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'system', 'announcement', 'image', 'file')),
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS for chat
ALTER TABLE public.chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Chat room policies
CREATE POLICY "Anyone can view public chat rooms" 
  ON public.chat_rooms 
  FOR SELECT 
  USING (NOT is_private OR created_by = auth.uid());

CREATE POLICY "Authenticated users can create chat rooms" 
  ON public.chat_rooms 
  FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL);

-- Chat message policies
CREATE POLICY "Users can view messages in accessible rooms" 
  ON public.chat_messages 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.chat_rooms 
      WHERE id = room_id AND (NOT is_private OR created_by = auth.uid())
    )
  );

CREATE POLICY "Authenticated users can send messages" 
  ON public.chat_messages 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('like', 'comment', 'follow', 'mention', 'event', 'business_update', 'system', 'chat_message')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  from_user_id UUID REFERENCES auth.users(id),
  target_id TEXT, -- Could be business_id, event_id, etc.
  action_url TEXT,
  metadata JSONB,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS for notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Notification policies
CREATE POLICY "Users can view their own notifications" 
  ON public.notifications 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" 
  ON public.notifications 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications" 
  ON public.notifications 
  FOR INSERT 
  WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS search_analytics_query_idx ON public.search_analytics(search_query);
CREATE INDEX IF NOT EXISTS search_analytics_created_at_idx ON public.search_analytics(created_at DESC);
CREATE INDEX IF NOT EXISTS business_updates_business_id_idx ON public.business_updates(business_id);
CREATE INDEX IF NOT EXISTS business_updates_created_at_idx ON public.business_updates(created_at DESC);
CREATE INDEX IF NOT EXISTS chat_messages_room_id_idx ON public.chat_messages(room_id);
CREATE INDEX IF NOT EXISTS chat_messages_created_at_idx ON public.chat_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS notifications_user_id_idx ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS notifications_created_at_idx ON public.notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS notifications_is_read_idx ON public.notifications(is_read);

-- Enable realtime for relevant tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.business_updates;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Set replica identity for realtime updates
ALTER TABLE public.business_updates REPLICA IDENTITY FULL;
ALTER TABLE public.chat_messages REPLICA IDENTITY FULL;
ALTER TABLE public.notifications REPLICA IDENTITY FULL;

-- Insert default chat rooms
INSERT INTO public.chat_rooms (name, description, is_private) VALUES
('General Discussion', 'Open chat for all members of the Alabama Business Directory', false),
('Business Networking', 'Connect with other business owners and entrepreneurs', false),
('Tech Talk', 'Discussions about technology and innovation in Alabama', false),
('Events & Meetups', 'Share and discuss upcoming business events and meetups', false)
ON CONFLICT DO NOTHING;
