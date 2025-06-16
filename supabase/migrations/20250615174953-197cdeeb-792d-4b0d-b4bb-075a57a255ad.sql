
-- First, check if the user already has an admin role and delete if exists
DELETE FROM admin_roles WHERE user_id = 'e68fafe7-92f6-4627-9b70-f0b423d7d781';

-- Insert admin role for the specified user
INSERT INTO admin_roles (user_id, role_level, assigned_by, created_at, updated_at)
VALUES (
  'e68fafe7-92f6-4627-9b70-f0b423d7d781',
  'super_admin',
  'e68fafe7-92f6-4627-9b70-f0b423d7d781',
  now(),
  now()
);

-- Also update the user's profile role
UPDATE profiles 
SET role = 'admin' 
WHERE id = 'e68fafe7-92f6-4627-9b70-f0b423d7d781';
