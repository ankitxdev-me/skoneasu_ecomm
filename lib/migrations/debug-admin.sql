-- DEBUG SCRIPT: Temporarily bypass Admin Check to verify data exists

-- 1. First, let's just count how many tickets exist TOTAL in the system
-- Run this query in the SQL Editor and look at the "Results" tab
SELECT count(*) as total_tickets FROM support_tickets;

-- 2. If count > 0, then we know tickets exist but you can't see them.
-- Let's try to verify your user role directly.
-- Replace 'YOUR_EMAIL_HERE' with your actual login email to check your role.
SELECT email, role FROM profiles WHERE email = 'YOUR_EMAIL_HERE';

-- 3. EMERGENCY FIX: If the previous fix didn't work, let's make the policy extremely permissive for a moment
-- to confirm if it's an RLS issue.
-- WARNING: This allows any logged-in user to view all tickets.
-- Only run this if you are stuck and need to verify tickets exist in the dashboard.

/* 
DROP POLICY IF EXISTS "Admins can view all tickets" ON support_tickets;
CREATE POLICY "Admins can view all tickets"
  ON support_tickets FOR SELECT
  USING ( true );  -- ALLOW EVERYONE
*/

-- 4. If you ran step 3 and can see tickets, then the issue is definitely the is_admin() check.
-- Revert the permissive policy after testing:
/*
DROP POLICY IF EXISTS "Admins can view all tickets" ON support_tickets;
CREATE POLICY "Admins can view all tickets"
  ON support_tickets FOR SELECT
  USING ( is_admin() );
*/
