-- Drop existing table if it exists
drop table if exists scripts cascade;

-- Create scripts table with all necessary columns
create table scripts (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  content text not null,
  is_public boolean default false,
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
