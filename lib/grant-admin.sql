-- Make multiple users admins by email
UPDATE public.profiles
SET role = 'admin'
WHERE email IN (
  'user1@example.com',
  'user2@example.com'
);

-- Verify the changes
SELECT * FROM public.profiles WHERE role = 'admin';
