
-- Create the saved_businesses table to store user's saved businesses
CREATE TABLE public.saved_businesses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  business_id BIGINT REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, business_id)
);

-- Enable RLS on saved_businesses table
ALTER TABLE public.saved_businesses ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for saved_businesses
CREATE POLICY "Users can view their own saved businesses" 
  ON public.saved_businesses 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can save businesses" 
  ON public.saved_businesses 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unsave their businesses" 
  ON public.saved_businesses 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create RPC function to get saved business IDs for a user
CREATE OR REPLACE FUNCTION public.get_saved_business_ids(user_id UUID)
RETURNS BIGINT[]
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT ARRAY_AGG(business_id) 
  FROM public.saved_businesses 
  WHERE saved_businesses.user_id = $1;
$$;

-- Create RPC function to save a business
CREATE OR REPLACE FUNCTION public.save_business(user_id UUID, business_id BIGINT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.saved_businesses (user_id, business_id)
  VALUES ($1, $2)
  ON CONFLICT (user_id, business_id) DO NOTHING;
END;
$$;

-- Create RPC function to unsave a business
CREATE OR REPLACE FUNCTION public.unsave_business(user_id UUID, business_id BIGINT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.saved_businesses 
  WHERE saved_businesses.user_id = $1 AND saved_businesses.business_id = $2;
END;
$$;
