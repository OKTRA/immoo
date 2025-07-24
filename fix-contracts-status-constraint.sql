-- Fix contracts status constraint to allow 'draft', 'assigned', and 'signed' values
-- First, drop the existing constraint if it exists
ALTER TABLE contracts DROP CONSTRAINT IF EXISTS contracts_status_check;

-- Add the correct constraint
ALTER TABLE contracts ADD CONSTRAINT contracts_status_check 
CHECK (status IN ('draft', 'assigned', 'signed'));

-- Update any existing contracts with invalid status to 'draft'
UPDATE contracts SET status = 'draft' WHERE status NOT IN ('draft', 'assigned', 'signed'); 