-- CURRENT ADMINS:
-- 1. ankitgupta72724@gmail.com
-- 2. nehagupt386@gmail.com

-- CURRENT USERS (Likely the ones you are trying to use):
-- 1. ankitgghbfbcjupta72724@gmail.com
-- 2. ankitgghjupta72724@gmail.com

-- Run the lines below to promote the other accounts to Admin:

UPDATE public.profiles
SET role = 'admin'
WHERE email IN (
    'ankitgghbfbcjupta72724@gmail.com', 
    'ankitgghjupta72724@gmail.com'
);

-- Or replace with your specific email:
-- UPDATE public.profiles SET role = 'admin' WHERE email = 'YOUR_EMAIL_HERE';
