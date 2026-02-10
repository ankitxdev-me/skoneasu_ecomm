-- FORCE SCHEMA CACHE REFRESH
-- By adding a comment to the column, we force PostgREST to notice the change.

COMMENT ON COLUMN public.profiles.email IS 'User Email Address';
COMMENT ON COLUMN public.profiles.role IS 'User Role (admin/user)';

NOTIFY pgrst, 'reload config';
