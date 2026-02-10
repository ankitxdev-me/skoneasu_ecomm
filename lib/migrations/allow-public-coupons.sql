-- Allow public read access to active coupons
-- This is needed for the validation API if the Service Role Key is not configured
CREATE POLICY "Public can read active coupons" ON public.coupons
  FOR SELECT USING (active = true);
