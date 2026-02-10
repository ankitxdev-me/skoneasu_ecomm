-- Add missing 'role' column to profiles table
-- Fixes "Database error saving new user" (500 Internal Server Error)

BEGIN;

-- Add role column if it doesn't exist
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';

-- Ensure RLS is still disabled (just in case)
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

COMMIT;
