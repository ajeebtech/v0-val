-- First, add the created_by column if it doesn't exist
ALTER TABLE scripts 
ADD COLUMN IF NOT EXISTS created_by text 
DEFAULT auth.uid()::text 
REFERENCES auth.users(id) 
ON DELETE CASCADE;

-- Create an index on created_by for better performance
CREATE INDEX IF NOT EXISTS idx_scripts_created_by ON scripts(created_by);

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Public scripts are viewable by everyone" ON scripts;
DROP POLICY IF EXISTS "Anyone can insert scripts" ON scripts;
DROP POLICY IF EXISTS "Anyone can update any script" ON scripts;
DROP POLICY IF EXISTS "Anyone can delete any script" ON scripts;
DROP POLICY IF EXISTS "Users can view their own scripts" ON scripts;
DROP POLICY IF EXISTS "Users can manage their own scripts" ON scripts;

-- Create a policy to allow public read access to public scripts
CREATE POLICY "Public scripts are viewable by everyone" 
ON scripts 
FOR SELECT 
TO public 
USING (is_public = true);

-- Create a policy to allow the server to insert scripts
CREATE POLICY "Server can insert scripts"
ON scripts
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Create a policy to allow the server to update any script
CREATE POLICY "Server can update any script"
ON scripts
FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- Create a policy to allow the server to delete any script
CREATE POLICY "Server can delete any script"
ON scripts
FOR DELETE
TO anon, authenticated
USING (true);

-- Create a policy to allow users to view their own scripts
CREATE POLICY "Users can view their own scripts"
ON scripts
FOR SELECT
TO authenticated
USING (auth.uid()::text = created_by);

-- Create a policy to allow users to manage their own scripts
CREATE POLICY "Users can manage their own scripts"
ON scripts
FOR ALL
TO authenticated
USING (auth.uid()::text = created_by)
WITH CHECK (auth.uid()::text = created_by);

-- Update the existing update_scripts_updated_at trigger to preserve created_by
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';
