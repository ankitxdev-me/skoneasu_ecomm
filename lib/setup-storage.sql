-- Create storage bucket for products if not exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('products', 'products', true)
ON CONFLICT (id) DO NOTHING;

-- Policy to allow public read access
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'products' );

-- Policy to allow authenticated users (admin checks handled in app/UI but good to restrict here too ideally)
-- For now, allowing authenticated users to insert/update/delete for simplicity as admin check is in API
CREATE POLICY "Auth Upload"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'products' AND auth.role() = 'authenticated' );

CREATE POLICY "Auth Update"
ON storage.objects FOR UPDATE
USING ( bucket_id = 'products' AND auth.role() = 'authenticated' );

CREATE POLICY "Auth Delete"
ON storage.objects FOR DELETE
USING ( bucket_id = 'products' AND auth.role() = 'authenticated' );
