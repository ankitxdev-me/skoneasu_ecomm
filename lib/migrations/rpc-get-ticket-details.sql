-- RPC to fetch single ticket details with messages for admin (Bypasses RLS)
-- Run this in Supabase SQL Editor

-- 1. DROP the old function first (Required because we are renaming the parameter)
DROP FUNCTION IF EXISTS get_support_ticket_details_admin(UUID);

-- 2. CREATE the new function with unambiguous parameter name
CREATE OR REPLACE FUNCTION get_support_ticket_details_admin(p_ticket_id UUID)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  ticket_data json;
  messages_data json;
BEGIN
  -- Get ticket info with user profile
  -- We use p_ticket_id to match the parameter, avoiding ambiguity with t.id or m.ticket_id
  SELECT json_build_object(
    'id', t.id,
    'subject', t.subject,
    'status', t.status,
    'priority', t.priority,
    'created_at', t.created_at,
    'updated_at', t.updated_at,
    'user_id', t.user_id,
    'user', json_build_object(
      'full_name', p.full_name,
      'email', p.email
    )
  ) INTO ticket_data
  FROM support_tickets t
  LEFT JOIN profiles p ON t.user_id = p.id
  WHERE t.id = p_ticket_id;

  -- Get messages
  SELECT json_agg(
    json_build_object(
      'id', m.id,
      'message', m.message,
      'created_at', m.created_at,
      'is_staff_reply', m.is_admin_reply,
      'sender_id', m.sender_id,
      'sender_name', CASE WHEN m.is_admin_reply THEN 'Support Team' ELSE p.full_name END
    ) ORDER BY m.created_at ASC
  ) INTO messages_data
  FROM support_messages m
  LEFT JOIN profiles p ON m.sender_id = p.id
  WHERE m.ticket_id = p_ticket_id;

  RETURN json_build_object(
    'ticket', ticket_data,
    'messages', COALESCE(messages_data, '[]'::json)
  );
END;
$$;
