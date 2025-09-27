-- Create a function to get database error information
create or replace function get_error_info()
returns json as $$
begin
  return json_build_object(
    'current_user', current_user,
    'session_user', session_user,
    'current_database', current_database(),
    'current_schema', current_schema,
    'in_recovery', pg_is_in_recovery(),
    'system_time', now(),
    'version', version()
  );
exception when others then
  return json_build_object(
    'error', SQLERRM,
    'state', SQLSTATE
  );
end;
$$ language plpgsql security definer;

-- Grant execute to public
revoke all on function get_error_info() from public;
grant execute on function get_error_info() to public;

-- Create a function to test inserts
create or replace function test_insert_script(
  p_title text,
  p_content text,
  p_is_public boolean default false
) returns json as $$
declare
  v_result json;
  v_error text;
begin
  insert into scripts (title, content, is_public)
  values (p_title, p_content, p_is_public)
  returning to_json(scripts.*) into v_result;
  
  return json_build_object(
    'success', true,
    'data', v_result
  );
exception when others then
  get stacked diagnostics v_error = message_text;
  return json_build_object(
    'success', false,
    'error', v_error,
    'sqlstate', sqlstate
  );
end;
$$ language plpgsql security definer;

-- Grant execute to public
revoke all on function test_insert_script(text, text, boolean) from public;
grant execute on function test_insert_script(text, text, boolean) to public;
