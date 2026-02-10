-- Fix Reviews Foreign Key Relationship
-- Currently views user_id -> auth.users(id).
-- API wants user_id -> public.profiles(id) to allow embedding "user:profiles(full_name)".

BEGIN;

-- Drop old constraint
ALTER TABLE reviews
DROP CONSTRAINT IF EXISTS reviews_user_id_fkey;

-- Add new constraint referencing profiles
ALTER TABLE reviews
ADD CONSTRAINT reviews_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES public.profiles(id)
ON DELETE CASCADE;

-- Also checking other user-linked tables just in case they need similar joins in future
-- (But currently only reviews seems to fail)
-- Wishlists, Cart Items, Orders usually queried BY user_id, not expanding user.

COMMIT;

-- Force refresh
NOTIFY pgrst, 'reload config';
