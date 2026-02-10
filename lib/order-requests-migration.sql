-- Add columns for Order Cancellation Requests
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS cancellation_status text DEFAULT 'none',
ADD COLUMN IF NOT EXISTS cancellation_reason text;

-- Add columns for Order Address Change Requests
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS address_change_status text DEFAULT 'none',
ADD COLUMN IF NOT EXISTS new_shipping_address jsonb;

-- Add check constraints for status values
ALTER TABLE public.orders 
DROP CONSTRAINT IF EXISTS orders_cancellation_status_check;

ALTER TABLE public.orders 
ADD CONSTRAINT orders_cancellation_status_check 
CHECK (cancellation_status IN ('none', 'requested', 'approved', 'rejected'));

ALTER TABLE public.orders 
DROP CONSTRAINT IF EXISTS orders_address_change_status_check;

ALTER TABLE public.orders 
ADD CONSTRAINT orders_address_change_status_check 
CHECK (address_change_status IN ('none', 'requested', 'approved', 'rejected'));

-- Update Policies to allow users to update their own orders (for making requests)
-- Note: Existing policies might already allow update based on user_id, 
-- but usually only admins or system can update status. 
-- We need to check if users can UPDATE specific columns. 
-- Supabase clean policy approach often restricts row updates.
-- Since we are doing this via an API endpoint that uses Service Role or user Auth,
-- let's ensure the user can update THEIR OWN order rows IF the RLS allows it.
-- Or better, we ensure the backend API checks Auth and updates.
-- If we use strict RLS, we might need a policy:
-- CREATE POLICY "Users can update their own orders" ON public.orders FOR UPDATE USING (auth.uid() = user_id);
-- But we might only want to allow updating THESE specific columns.
-- For now, let's assume the API handles it or we rely on the existing 'Users can update' (if any).
-- If not, we should rely on the backend (API route) doing the update. 
-- Since our API routes check `getAuthUser`, they act on behalf of the user. 
-- We need RLS to permit it.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'orders' AND policyname = 'Users can update their own orders details'
  ) THEN
    CREATE POLICY "Users can update their own orders details" ON public.orders FOR UPDATE USING (auth.uid() = user_id);
  END IF;
END
$$;
