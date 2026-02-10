-- RESET PROFILES TABLE
-- The table was created with missing columns. We need to recreate it properly.

BEGIN;

DROP TABLE IF EXISTS public.profiles CASCADE;

CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Disable RLS for now (as per valid configuration)
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Grant access
GRANT ALL ON public.profiles TO postgres;
GRANT ALL ON public.profiles TO anon;
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;

COMMIT;

-- Force cache refresh
NOTIFY pgrst, 'reload config';
