-- 1. Create Archive Table
create table if not exists public.archived_users (
  archive_id uuid primary key default gen_random_uuid(),
  original_user_id uuid,
  email text,
  full_name text,
  role text,
  original_created_at timestamptz,
  archived_at timestamptz default now()
);

-- Enable RLS on archive table (optional, but good practice restriction)
alter table public.archived_users enable row level security;

-- Policy: Only owners can view archives
create policy "Owners can view archives" on public.archived_users
  for select using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'owner')
  );

-- 2. Create Secure Deletion Function
create or replace function public.delete_user_by_id(user_id uuid)
returns void
language plpgsql
security definer -- Runs with admin privileges
set search_path = public
as $$
declare
  is_executing_owner boolean;
  user_email text;
  user_name text;
  user_role text;
  user_created_at timestamptz;
begin
  -- A. Check if the executor is an owner
  select exists (
    select 1 from profiles
    where id = auth.uid()
    and role = 'owner'
  ) into is_executing_owner;

  if not is_executing_owner then
    raise exception 'Access Denied: Only owners can delete users.';
  end if;

  -- B. Get user data for archiving
  select email, full_name, role, created_at 
  into user_email, user_name, user_role, user_created_at
  from profiles 
  where id = user_id;

  -- C. Archive data (if profile existed)
  if found then
    insert into public.archived_users (original_user_id, email, full_name, role, original_created_at)
    values (user_id, user_email, user_name, user_role, user_created_at);
  end if;

  -- D. Delete from auth.users (Cascades to profiles)
  delete from auth.users where id = user_id;
  
end;
$$;
