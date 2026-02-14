-- Add is_pinned column to reviews table
ALTER TABLE public.reviews
ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT false;

-- Create policy/index if needed (optional but good for performance if many reviews)
CREATE INDEX IF NOT EXISTS idx_reviews_is_pinned ON public.reviews(is_pinned) WHERE is_pinned = true;
