-- Add coupon_code column to orders table
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS coupon_code TEXT;

-- We already have discount column, but maybe split it?
-- The current logic sums GST-discount and Coupon-discount into 'discount'.
-- That might be confusing for display.
-- Let's stick to the current logic for now, but ensure proper storage.
