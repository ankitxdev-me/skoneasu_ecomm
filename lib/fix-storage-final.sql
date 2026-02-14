-- Comprehensive Storage Fix for RLS
BEGIN;

-- 1. Ensure storage schema usage (sometimes implicit permissions are missing)
GRANT USAGE ON SCHEMA storage TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA storage TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA storage TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA storage TO postgres, anon, authenticated, service_role;

-- 2. Make sure bucket exists and is public
INSERT INTO storage.buckets (id, name, public) 
VALUES ('review-images', 'review-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 3. STORAGE OBJECTS RLS
-- Enable RLS just in case
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 4. Clean Slate Policies (Drop potential conflicts)
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload review images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own review images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own review images" ON storage.objects;
DROP POLICY IF EXISTS "Give public access to review-images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated uploads to review-images" ON storage.objects;
DROP POLICY IF EXISTS "Public Access to review-images" ON storage.objects;

-- 5. Create Fresh, Verified Policies

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
