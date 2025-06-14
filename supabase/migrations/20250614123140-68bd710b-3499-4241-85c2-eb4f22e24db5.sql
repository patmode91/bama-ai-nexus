
-- Create reviews table for user reviews and ratings
CREATE TABLE public.reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  business_id BIGINT REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, business_id)
);

-- Create verification requests table
CREATE TABLE public.verification_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id BIGINT REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
  requested_by UUID REFERENCES auth.users NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  documents_url TEXT[],
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create analytics events table
CREATE TABLE public.analytics_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL,
  business_id BIGINT REFERENCES public.businesses(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- RLS policies for reviews
CREATE POLICY "Anyone can view reviews" 
  ON public.reviews 
  FOR SELECT 
  TO public
  USING (true);

CREATE POLICY "Authenticated users can create reviews" 
  ON public.reviews 
  FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews" 
  ON public.reviews 
  FOR UPDATE 
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews" 
  ON public.reviews 
  FOR DELETE 
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS policies for verification requests
CREATE POLICY "Anyone can view verification requests" 
  ON public.verification_requests 
  FOR SELECT 
  TO public
  USING (true);

CREATE POLICY "Authenticated users can create verification requests" 
  ON public.verification_requests 
  FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = requested_by);

-- RLS policies for analytics events
CREATE POLICY "Anyone can insert analytics events" 
  ON public.analytics_events 
  FOR INSERT 
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can view analytics events" 
  ON public.analytics_events 
  FOR SELECT 
  TO public
  USING (true);

-- Function to update business rating when reviews change
CREATE OR REPLACE FUNCTION update_business_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.businesses 
  SET rating = (
    SELECT ROUND(AVG(rating)::numeric, 1)
    FROM public.reviews 
    WHERE business_id = COALESCE(NEW.business_id, OLD.business_id)
  )
  WHERE id = COALESCE(NEW.business_id, OLD.business_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update business rating
CREATE TRIGGER update_business_rating_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_business_rating();
