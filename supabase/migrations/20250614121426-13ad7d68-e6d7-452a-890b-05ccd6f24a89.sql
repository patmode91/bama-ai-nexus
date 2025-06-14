
-- Drop all existing policies on businesses table
DROP POLICY IF EXISTS "Anyone can view businesses" ON public.businesses;
DROP POLICY IF EXISTS "Anyone can insert businesses" ON public.businesses;
DROP POLICY IF EXISTS "Authenticated users can update businesses" ON public.businesses;
DROP POLICY IF EXISTS "Authenticated users can delete businesses" ON public.businesses;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.businesses;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.businesses;

-- Create new policies with unique names that allow public access
CREATE POLICY "public_select_businesses" 
  ON public.businesses 
  FOR SELECT 
  TO public
  USING (true);

CREATE POLICY "public_insert_businesses" 
  ON public.businesses 
  FOR INSERT 
  TO public
  WITH CHECK (true);

CREATE POLICY "authenticated_update_businesses" 
  ON public.businesses 
  FOR UPDATE 
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "authenticated_delete_businesses" 
  ON public.businesses 
  FOR DELETE 
  TO authenticated
  USING (true);
