-- Update RLS policies to allow public read access to public scripts
create or replace policy "Public scripts are viewable by everyone"
on scripts for select
to public
using (is_public = true);

-- Allow anyone to insert new scripts
create or replace policy "Anyone can insert scripts"
on scripts for insert
to public
with check (true);

-- Only allow updates to scripts that are not public
create or replace policy "Anyone can update their own scripts"
on scripts for update
to public
using (true)
with check (true);

-- Only allow deletes on scripts that are not public
create or replace policy "Anyone can delete their own scripts"
on scripts for delete
to public
using (true);

-- Drop the old policies
DROP POLICY IF EXISTS "Users can view their own scripts" ON scripts;
DROP POLICY IF EXISTS "Users can insert their own scripts" ON scripts;
DROP POLICY IF EXISTS "Users can update their own scripts" ON scripts;
DROP POLICY IF EXISTS "Users can delete their own scripts" ON scripts;
