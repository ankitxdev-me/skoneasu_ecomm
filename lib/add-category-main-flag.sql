
-- Add is_main column to categories table for navbar visibility
BEGIN;

ALTER TABLE categories
ADD COLUMN IF NOT EXISTS is_main BOOLEAN DEFAULT false;

COMMIT;

-- Force refresh
NOTIFY pgrst, 'reload config';
