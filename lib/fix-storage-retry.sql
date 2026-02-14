-- Storage RLS Fix (Retry without schema alterations)
BEGIN;

-- 1. Ensure bucket exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('review-images', 'review-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Drop existing policies to proceed
-- We must drop potential existing policies to replace them.
-- If these fail because "policy does not exist", it's fine, but the transaction might roll back?
-- In PL/pgSQL we could use DO block, but let's try straight SQL commands that are likely to pass or fail gracefully if handled.
-- Actually, DROP POLICY IF EXISTS handles non-existence.
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload review images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own review images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own review images" ON storage.objects;
DROP POLICY IF EXISTS "Give public access to review-images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated uploads to review-images" ON storage.objects;
DROP POLICY IF EXISTS "Public Access to review-images" ON storage.objects;

-- 3. Create permissive policies for testing (but still secure enough for images)

-- Public Read Access
CREATE POLICY "Public Access to review-images"
ON storage.objects FOR SELECT
USING ( bucket_id = 'review-images' );

-- Authenticated Insert Access
CREATE POLICY "Authenticated users can upload review images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'review-images' 
  AND auth.role() = 'authenticated'
);

-- Owner Update Access
CREATE POLICY "Users can update own review images"
ON storage.objects FOR UPDATE
USING ( bucket_id = 'review-images' AND auth.uid() = owner )
WITH CHECK ( bucket_id = 'review-images' AND auth.uid() = owner );

-- Owner Delete Access
CREATE POLICY "Users can delete own review images"
ON storage.objects FOR DELETE
USING ( bucket_id = 'review-images' AND auth.uid() = owner );

COMMIT;
