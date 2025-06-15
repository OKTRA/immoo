
-- Add is_visible column to properties table
ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS is_visible BOOLEAN DEFAULT true;

-- Create index for better performance on visibility queries
CREATE INDEX IF NOT EXISTS properties_is_visible_idx ON public.properties(is_visible);
