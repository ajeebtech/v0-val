-- Add position column to todos table
alter table public.todos
  add column if not exists position integer default 0;

-- Create an index on position for better performance
create index if not exists idx_todos_position on public.todos (user_id, position);

-- Update existing todos to have sequential positions
with numbered_todos as (
  select 
    id,
    row_number() over (partition by user_id order by created_at desc) as new_position
  from public.todos
)
update public.todos t
set position = n.new_position
from numbered_todos n
where t.id = n.id;
