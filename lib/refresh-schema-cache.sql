-- Refresh Supabase Schema Cache
-- Fixes "Could not find column ... in schema cache"

NOTIFY pgrst, 'reload config';
