-- WARNING: This will permanently delete ALL order data.
-- Run this in your Supabase SQL Editor.

-- Step 1: Delete all items within orders (to avoid foreign key constraint errors)
DELETE FROM public.order_items;

-- Step 2: Delete all orders
DELETE FROM public.orders;

-- Verify deletion (Optional)
SELECT count(*) FROM public.orders;
