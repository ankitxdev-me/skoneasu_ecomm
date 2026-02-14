-- Allow Admins to update any review (for pinning, moderation, etc.)
-- This requires checking the user's role in the `profiles` table.

-- We need a policy that checks if the current user is an admin.
-- Note: This assumes `auth.uid()` maps to `id` in `profiles` and `role` is 'admin'.

CREATE POLICY "Admins can update any review"
ON reviews
FOR UPDATE
USING (
  exists (
    select 1 from profiles
    where profiles.id = auth.uid()
    and profiles.role = 'admin'
  )
);

-- Also allow admins to delete reviews if needed (good practice for moderation)
CREATE POLICY "Admins can delete any review"
ON reviews
FOR DELETE
USING (
  exists (
    select 1 from profiles
    where profiles.id = auth.uid()
    and profiles.role = 'admin'
  )
);

-- Ensure is_pinned column exists just in case
ALTER TABLE public.reviews
ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT false;
