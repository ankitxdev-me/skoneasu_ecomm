-- Create RPC function to get stats (Bypasses RLS)
-- Run this in Supabase SQL Editor

CREATE OR REPLACE FUNCTION get_admin_stats()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with superuser privileges
AS $$
BEGIN
  RETURN json_build_object(
    'total_tickets', (SELECT count(*) FROM support_tickets),
    'open_tickets', (SELECT count(*) FROM support_tickets WHERE status = 'open'),
    'closed_tickets', (SELECT count(*) FROM support_tickets WHERE status = 'closed')
  );
END;
$$;
