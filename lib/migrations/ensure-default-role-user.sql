ALTER TABLE profiles ALTER COLUMN role SET DEFAULT 'user';

-- Ensure all current null roles are user
UPDATE profiles SET role = 'user' WHERE role IS NULL;
