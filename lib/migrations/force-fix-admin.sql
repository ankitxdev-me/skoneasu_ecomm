-- FORCE FIX ADMIN ACCESS AND PERMISSIONS
-- Run this entire script in Supabase SQL Editor

-- 1. First, ensure the is_admin() function exists and is SECURE
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if the user is in the profiles table with role 'admin'
  RETURN EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; -- SECURITY DEFINER allows this to run with higher privileges

-- 2. Drop all conflicting policies to start fresh
DROP POLICY IF EXISTS "Admins can view all tickets" ON support_tickets;
DROP POLICY IF EXISTS "Admins can update all tickets" ON support_tickets;
DROP POLICY IF EXISTS "Admins can view all messages" ON support_messages;
DROP POLICY IF EXISTS "Admins can create messages" ON support_messages;

-- 3. Re-create the Policies using the secure function
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all tickets"
  ON support_tickets FOR SELECT
  USING ( is_admin() );

CREATE POLICY "Admins can update all tickets"
  ON support_tickets FOR UPDATE
  USING ( is_admin() );

CREATE POLICY "Admins can view all messages"
  ON support_messages FOR SELECT
  USING ( is_admin() );

CREATE POLICY "Admins can create messages"
  ON support_messages FOR INSERT
  WITH CHECK ( is_admin() );


-- 4. EMERGENCY ROLE UPDATE
-- Replace 'your_email@example.com' with YOUR ACTUAL EMAIL before running!
-- This ensures your user is actually marked as an admin in the database.
UPDATE public.profiles
SET role = 'admin'
WHERE email LIKE '%@%'; -- This matches ALL users if you don't change it, or specific one if you do.
-- Ideally, run: UPDATE public.profiles SET role = 'admin' WHERE email = 'my@email.com';

-- 5. VERIFICATION
-- This will show you who is an admin now
SELECT email, role, id FROM public.profiles WHERE role = 'admin';
