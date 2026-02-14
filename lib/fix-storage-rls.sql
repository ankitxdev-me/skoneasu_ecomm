-- Make sure the bucket exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('review-images', 'review-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Drop ALL possible existing policies for this bucket to avoid conflicts
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload review images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own review images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own review images" ON storage.objects;
DROP POLICY IF EXISTS "Give public access to review-images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated uploads to review-images" ON storage.objects;
DROP POLICY IF EXISTS "Public Access to review-images" ON storage.objects;

-- Create policies

-- 1. Public can view images
CREATE POLICY "Public Access to review-images"
ON storage.objects FOR SELECT
USING ( bucket_id = 'review-images' );

-- 2. Authenticated users can upload images
CREATE POLICY "Authenticated users can upload review images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'review-images' AND
  auth.role() = 'authenticated'
);

-- 3. Users can update their own images (optional)
CREATE POLICY "Users can update own review images"
ON storage.objects FOR UPDATE
USING ( bucket_id = 'review-images' AND auth.uid() = owner )
WITH CHECK ( bucket_id = 'review-images' AND auth.uid() = owner );

-- 4. Users can delete their own images (optional)
CREATE POLICY "Users can delete own review images"
ON storage.objects FOR DELETE
USING ( bucket_id = 'review-images' AND auth.uid() = owner );
