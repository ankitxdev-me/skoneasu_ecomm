
-- Debug storage policy: Allow PUBLIC uploads
-- This will bypass auth checks for debugging purposes
-- Run this in your Supabase SQL Editor

BEGIN;

-- Ensure the bucket exists
INSERT INTO storage.buckets (id, name, public) 
VALUES ('products', 'products', true) 
ON CONFLICT (id) DO UPDATE SET public = true;

-- Drop prior policies to avoid conflicts
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Auth Upload" ON storage.objects;
DROP POLICY IF EXISTS "Auth Update" ON storage.objects;
DROP POLICY IF EXISTS "Auth Delete" ON storage.objects;
DROP POLICY IF EXISTS "Give me access to own files" ON storage.objects;
DROP POLICY IF EXISTS "Product images are viewable by everyone" ON storage.objects;
DROP POLICY IF EXISTS "Public Upload Debug" ON storage.objects;

-- Create a SINGLE, wildly permissive policy for the products bucket
CREATE POLICY "Public Upload Debug"
ON storage.objects FOR ALL
USING ( bucket_id = 'products' )
WITH CHECK ( bucket_id = 'products' );

COMMIT;
