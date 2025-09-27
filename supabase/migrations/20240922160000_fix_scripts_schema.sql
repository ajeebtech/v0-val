-- First, drop existing table if it exists
drop table if exists scripts cascade;

-- Create the scripts table with proper schema
create table scripts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text not null,
  is_public boolean not null default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table scripts enable row level security;

-- Create policies for public access
create policy "Public scripts are viewable by everyone"
on scripts for select
to public
using (is_public = true);

create policy "Anyone can insert scripts"
on scripts for insert
to public
with check (true);

create policy "Anyone can update any script"
on scripts for update
to public
using (true)
with check (true);

create policy "Anyone can delete any script"
on scripts for delete
to public
using (true);

-- Create indexes for better performance
create index idx_scripts_created_at on scripts(created_at desc);
create index idx_scripts_is_public on scripts(is_public);

-- Create a trigger to update the updated_at column
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_scripts_updated_at
before update on scripts
for each row
execute function update_updated_at_column();

-- Add a comment to the table
comment on table scripts is 'Stores user scripts with public/private visibility';

-- Add comments to columns
comment on column scripts.id is 'Primary key';
comment on column scripts.title is 'Title of the script';
comment on column scripts.content is 'Content of the script';
comment on column scripts.is_public is 'Whether the script is visible to everyone';
comment on column scripts.created_at is 'When the script was created';
comment on column scripts.updated_at is 'When the script was last updated';
