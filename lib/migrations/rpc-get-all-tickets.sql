-- RPC to fetch all tickets with user details (Bypasses RLS)
-- Run this in Supabase SQL Editor

CREATE OR REPLACE FUNCTION get_all_support_tickets_admin()
RETURNS TABLE (
  id UUID,
  subject TEXT,
  status TEXT,
  priority TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  user_full_name TEXT,
  user_email TEXT,
  user_id UUID
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.id,
    t.subject,
    t.status,
    t.priority,
    t.created_at,
    t.updated_at,
    p.full_name as user_full_name,
    p.email as user_email,
    t.user_id
  FROM support_tickets t
  LEFT JOIN profiles p ON t.user_id = p.id
  ORDER BY t.created_at DESC;
END;
$$;
