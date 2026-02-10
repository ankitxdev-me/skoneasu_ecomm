-- CLEANUP & FIX CONSTRAINTS
-- 1. Delete "Ghost" Profiles (profiles with no matching Auth User)
--    This fixes "User already registered" (duplicate email) error when Auth user was deleted.

DELETE FROM public.profiles
WHERE id NOT IN (SELECT id FROM auth.users);

-- 2. Add CASCADE DELETE to prevent this in the future
--    (If you delete a User in Auth, their Profile will automatically vanish)

ALTER TABLE public.profiles
DROP CONSTRAINT IF EXISTS profiles_id_fkey;

ALTER TABLE public.profiles
ADD CONSTRAINT profiles_id_fkey
FOREIGN KEY (id)
REFERENCES auth.users(id)
ON DELETE CASCADE;

COMMIT;
