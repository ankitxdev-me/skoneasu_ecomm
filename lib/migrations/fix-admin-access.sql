-- Fix Admin Access Policies using a Security Definer Function

-- 1. Create a secure function to check admin status (bypasses RLS)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Update RLS on support_tickets
DROP POLICY IF EXISTS "Admins can view all tickets" ON support_tickets;
DROP POLICY IF EXISTS "Admins can update all tickets" ON support_tickets;

CREATE POLICY "Admins can view all tickets"
  ON support_tickets FOR SELECT
  USING ( is_admin() );

CREATE POLICY "Admins can update all tickets"
  ON support_tickets FOR UPDATE
  USING ( is_admin() );

-- 3. Update RLS on support_messages
DROP POLICY IF EXISTS "Admins can view all messages" ON support_messages;
DROP POLICY IF EXISTS "Admins can create messages" ON support_messages;

CREATE POLICY "Admins can view all messages"
  ON support_messages FOR SELECT
  USING ( is_admin() );

CREATE POLICY "Admins can create messages"
  ON support_messages FOR INSERT
  WITH CHECK ( is_admin() );

-- 4. Update Storage Policies
DROP POLICY IF EXISTS "Users can read their own attachments" ON storage.objects;

CREATE POLICY "Users and Admins can read attachments"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'support-attachments' AND
  (auth.uid() = owner OR is_admin())
);
