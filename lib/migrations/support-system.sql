-- Support Tickets Table
CREATE TABLE IF NOT EXISTS support_tickets (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  status TEXT DEFAULT 'open', -- open, in_progress, closed
  priority TEXT DEFAULT 'normal', -- low, normal, high
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Support Messages Table
CREATE TABLE IF NOT EXISTS support_messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  ticket_id UUID REFERENCES support_tickets(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  message TEXT NOT NULL,
  attachments TEXT[], -- Array of URLs
  is_admin_reply BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for Tickets
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own tickets"
  ON support_tickets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create tickets"
  ON support_tickets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tickets" -- e.g. to close them
  ON support_tickets FOR UPDATE
  USING (auth.uid() = user_id);

-- Admins can view/edit all tickets
-- Note: complex policy to check admin status via profiles table or metadata
-- Ideally we use a secure function or just check if the user is admin in the specialized admin client
-- For simplicity in RLS, we'll assume a public profile check or similar, but let's stick to the pattern used in the app.
-- The app seems to check `profiles.role` in the client.
-- We can add a policy for admins if we can join profiles.
-- For now, let's create a policy that allows everything for users with admin role in metadata or profile
-- Actually, the existing schema has `profiles` table with `role`.
-- Let's try to usage that.

CREATE POLICY "Admins can view all tickets"
  ON support_tickets FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can update all tickets"
  ON support_tickets FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );


-- RLS for Messages
ALTER TABLE support_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages for their tickets"
  ON support_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM support_tickets
      WHERE support_tickets.id = support_messages.ticket_id
      AND support_tickets.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create messages in their tickets"
  ON support_messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM support_tickets
      WHERE support_tickets.id = ticket_id
      AND support_tickets.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all messages"
  ON support_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

CREATE POLICY "Admins can create messages"
  ON support_messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Create Storage Bucket for Attachments if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('support-attachments', 'support-attachments', false)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies
-- We need to enable RLS on storage.objects if not already enabled, but usually it is.
-- Policy: Users can upload
CREATE POLICY "Users can upload attachments"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'support-attachments' AND
  auth.role() = 'authenticated'
);

-- Policy: Users can view their own attachments (hard to enforce strictly without linking to ticket,
-- but we can restrict to authenticated users for now or rely on signed URLs)
-- Since the bucket is private (public=false), we MUST use signed URLs.
-- Creating a policy to allow read if you are the owner or admin is good.

CREATE POLICY "Users can read their own attachments"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'support-attachments' AND
  (auth.uid() = owner OR 
   EXISTS (
     SELECT 1 FROM profiles
     WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
   ))
);
