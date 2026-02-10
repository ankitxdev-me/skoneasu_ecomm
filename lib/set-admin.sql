-- Update a user to admin role by email
-- Replace 'YOUR_EMAIL_HERE' with the actual email address

UPDATE public.profiles
SET role = 'admin'
WHERE email = 'YOUR_EMAIL_HERE';

-- Verify the change
SELECT * FROM public.profiles WHERE role = 'admin';
