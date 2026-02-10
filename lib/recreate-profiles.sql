-- Recreate Profiles Table & Fix Permissions
-- This fixes "relation profiles does not exist" error

BEGIN;

-- 1. Create table if it doesn't exist
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 3. Grant Permissions
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);

-- 4. Grant access to other related tables just in case
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public Read Reviews" ON reviews;
CREATE POLICY "Public Read Reviews" ON reviews FOR SELECT USING (true);

COMMIT;
