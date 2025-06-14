
-- Create a table to track business ownership claims
CREATE TABLE public.business_claims (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id BIGINT NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  claim_type TEXT NOT NULL DEFAULT 'ownership' CHECK (claim_type IN ('ownership', 'management')),
  supporting_documents JSONB,
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(business_id, user_id)
);

-- Add Row Level Security
ALTER TABLE public.business_claims ENABLE ROW LEVEL SECURITY;

-- Users can view their own claims
CREATE POLICY "Users can view their own claims" 
  ON public.business_claims 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Users can create their own claims
CREATE POLICY "Users can create their own claims" 
  ON public.business_claims 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own pending claims
CREATE POLICY "Users can update their own pending claims" 
  ON public.business_claims 
  FOR UPDATE 
  USING (auth.uid() = user_id AND status = 'pending');

-- Add an owner_id column to businesses table to track approved ownership
ALTER TABLE public.businesses ADD COLUMN owner_id UUID REFERENCES auth.users(id);

-- Create an index for better performance
CREATE INDEX idx_business_claims_user_id ON public.business_claims(user_id);
CREATE INDEX idx_business_claims_business_id ON public.business_claims(business_id);
CREATE INDEX idx_businesses_owner_id ON public.businesses(owner_id);

-- Function to approve business claim and set ownership
CREATE OR REPLACE FUNCTION public.approve_business_claim(claim_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  claim_record public.business_claims;
BEGIN
  -- Get the claim record
  SELECT * INTO claim_record FROM public.business_claims WHERE id = claim_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Claim not found';
  END IF;
  
  -- Update the claim status
  UPDATE public.business_claims 
  SET status = 'approved', updated_at = now()
  WHERE id = claim_id;
  
  -- Set the business owner
  UPDATE public.businesses 
  SET owner_id = claim_record.user_id, updated_at = now()
  WHERE id = claim_record.business_id;
END;
$$;
