-- Enable RLS on reviews table
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Reviews are viewable by everyone" ON reviews;
DROP POLICY IF EXISTS "Authenticated users can insert reviews" ON reviews;
DROP POLICY IF EXISTS "Users can update their own reviews" ON reviews;
DROP POLICY IF EXISTS "Users can delete their own reviews" ON reviews;

-- Create policies

-- 1. Everyone can view reviews
CREATE POLICY "Reviews are viewable by everyone" 
ON reviews FOR SELECT 
USING (true);

-- 2. Authenticated users can insert reviews (linking to their own user_id)
CREATE POLICY "Authenticated users can insert reviews" 
ON reviews FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- 3. Users can update their own reviews
CREATE POLICY "Users can update their own reviews" 
ON reviews FOR UPDATE 
USING (auth.uid() = user_id);

-- 4. Users can delete their own reviews
CREATE POLICY "Users can delete their own reviews" 
ON reviews FOR DELETE 
USING (auth.uid() = user_id);
