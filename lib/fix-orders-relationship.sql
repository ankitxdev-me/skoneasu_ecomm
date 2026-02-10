
-- Fix Orders Foreign Key Relationship
-- Currently views user_id -> auth.users(id).
-- API wants user_id -> public.profiles(id) to allow embedding "user:profiles(full_name)" in Admin API.

BEGIN;

-- Drop old constraint
ALTER TABLE orders
DROP CONSTRAINT IF EXISTS orders_user_id_fkey;

-- Add new constraint referencing profiles
ALTER TABLE orders
ADD CONSTRAINT orders_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES public.profiles(id)
ON DELETE SET NULL;

COMMIT;

-- Force refresh
NOTIFY pgrst, 'reload config';
