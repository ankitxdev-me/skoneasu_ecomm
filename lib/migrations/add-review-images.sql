-- Add image_url to reviews table
ALTER TABLE public.reviews
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Create storage bucket for review images if not exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('review-images', 'review-images', true)
ON CONFLICT (id) DO NOTHING;

-- Policy to allow public to view review images
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'review-images' );

-- Policy to allow authenticated users to upload review images
CREATE POLICY "Authenticated users can upload review images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'review-images' AND
  auth.role() = 'authenticated'
);
