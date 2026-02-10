
-- Fix storage policies for products bucket
-- Run this in your Supabase SQL Editor

BEGIN;

-- Ensure the bucket exists (idempotent)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('products', 'products', true) 
ON CONFLICT (id) DO UPDATE SET public = true;

-- Drop existing policies to avoid conflicts (and fix potentially broken ones)
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Auth Upload" ON storage.objects;
DROP POLICY IF EXISTS "Auth Update" ON storage.objects;
DROP POLICY IF EXISTS "Auth Delete" ON storage.objects;
DROP POLICY IF EXISTS "Give me access to own files" ON storage.objects;
DROP POLICY IF EXISTS "Product images are viewable by everyone" ON storage.objects;

-- Re-create policies with permissive checks for authenticated users

-- 1. Public Read Access - allow anyone to see the images
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'products' );

-- 2. Authenticated Insert Access (Upload) - allow any logged-in user to upload
CREATE POLICY "Auth Upload"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'products' AND auth.role() = 'authenticated' );

-- 3. Authenticated Update Access - allow any logged-in user to update files
CREATE POLICY "Auth Update"
ON storage.objects FOR UPDATE
USING ( bucket_id = 'products' AND auth.role() = 'authenticated' );

-- 4. Authenticated Delete Access - allow any logged-in user to delete files
CREATE POLICY "Auth Delete"
ON storage.objects FOR DELETE
USING ( bucket_id = 'products' AND auth.role() = 'authenticated' );

COMMIT;
