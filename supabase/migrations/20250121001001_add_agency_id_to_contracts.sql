-- Add agency_id column to contracts table
-- This allows contracts to be linked to specific agencies

ALTER TABLE contracts 
ADD COLUMN IF NOT EXISTS agency_id UUID REFERENCES agencies(id) ON DELETE SET NULL;

-- Create index for better performance on agency queries
CREATE INDEX IF NOT EXISTS idx_contracts_agency_id ON contracts(agency_id);

-- Update RLS policies to allow agencies to see their own contracts
DROP POLICY IF EXISTS "Allow all authenticated users to see contracts" ON contracts;

-- Create policy to allow users to see contracts from their agencies
CREATE POLICY "Users can see contracts from their agencies" ON contracts
FOR SELECT TO authenticated
USING (
  agency_id IS NULL OR -- Allow contracts without agency (legacy/admin contracts)
  agency_id IN (
    SELECT a.id 
    FROM agencies a 
    WHERE a.user_id = auth.uid()
  )
);

-- Allow users to create contracts for their agencies
CREATE POLICY "Users can create contracts for their agencies" ON contracts
FOR INSERT TO authenticated
WITH CHECK (
  agency_id IS NULL OR -- Allow contracts without agency
  agency_id IN (
    SELECT a.id 
    FROM agencies a 
    WHERE a.user_id = auth.uid()
  )
);

-- Allow users to update contracts from their agencies  
CREATE POLICY "Users can update contracts from their agencies" ON contracts
FOR UPDATE TO authenticated
USING (
  agency_id IS NULL OR
  agency_id IN (
    SELECT a.id 
    FROM agencies a 
    WHERE a.user_id = auth.uid()
  )
)
WITH CHECK (
  agency_id IS NULL OR
  agency_id IN (
    SELECT a.id 
    FROM agencies a 
    WHERE a.user_id = auth.uid()
  )
);

-- Enable RLS on contracts table
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY; 