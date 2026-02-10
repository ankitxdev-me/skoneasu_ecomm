-- RPC to allow Admins to Reply and Update Tickets (Bypassing RLS)
-- Run this in Supabase SQL Editor

-- 1. Admin Reply Function
CREATE OR REPLACE FUNCTION admin_reply_to_ticket(
  p_ticket_id UUID,
  p_sender_id UUID,
  p_message TEXT,
  p_attachments TEXT[],
  p_status TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_message_id UUID;
  v_updated_ticket JSON;
BEGIN
  -- Insert the message
  INSERT INTO support_messages (ticket_id, sender_id, message, attachments, is_admin_reply)
  VALUES (p_ticket_id, p_sender_id, p_message, p_attachments, true)
  RETURNING id INTO v_message_id;

  -- Update the ticket status and timestamp
  UPDATE support_tickets
  SET 
    status = p_status,
    updated_at = NOW()
  WHERE id = p_ticket_id;

  -- Return success
  RETURN json_build_object(
    'success', true,
    'message_id', v_message_id
  );
END;
$$;

-- 2. Admin Update Status Function
CREATE OR REPLACE FUNCTION admin_update_ticket_status(
  p_ticket_id UUID,
  p_status TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE support_tickets
  SET 
    status = p_status,
    updated_at = NOW()
  WHERE id = p_ticket_id;

  RETURN json_build_object('success', true);
END;
$$;
