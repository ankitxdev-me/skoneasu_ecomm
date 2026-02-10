-- Remove Auth Trigger to prevent conflicts
-- The API handles profile creation, so we don't need the trigger for email signups.
-- This fixes "Database error saving new user".

BEGIN;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

COMMIT;
