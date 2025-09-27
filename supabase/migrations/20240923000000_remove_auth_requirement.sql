-- Make user_id nullable and remove not null constraint
alter table public.todos 
alter column user_id drop not null;

-- Drop existing RLS policies
drop policy if exists "Users can view their own todos" on public.todos;
drop policy if exists "Users can insert their own todos" on public.todos;
drop policy if exists "Users can update their own todos" on public.todos;
drop policy if exists "Users can delete their own todos" on public.todos;

-- Create new policies that don't require authentication
create policy "Allow public access to todos"
  on public.todos for all
  using (true)
  with check (true);

-- Create a default user_id function for inserts
create or replace function public.get_default_user_id()
returns uuid as $$
begin
  return null; -- Return null for unauthenticated users
end;
$$ language plpgsql security definer;

-- Set the default value for user_id
alter table public.todos 
alter column user_id set default public.get_default_user_id();
