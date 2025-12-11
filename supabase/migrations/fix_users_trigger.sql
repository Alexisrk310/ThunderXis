-- Enable RLS
alter table public.profiles enable row level security;

-- 1. Ensure the table exists
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Safely add columns if they don't exist
do $$
begin
    if not exists (select 1 from information_schema.columns where table_name = 'profiles' and column_name = 'email') then
        alter table public.profiles add column email text;
    end if;

    if not exists (select 1 from information_schema.columns where table_name = 'profiles' and column_name = 'full_name') then
        alter table public.profiles add column full_name text;
    end if;

    if not exists (select 1 from information_schema.columns where table_name = 'profiles' and column_name = 'role') then
        alter table public.profiles add column role text default 'user';
    end if;
end $$;

-- 3. Function to handle new user creation
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'full_name',
    'user'
  )
  on conflict (id) do update
  set 
    email = excluded.email,
    full_name = coalesce(public.profiles.full_name, excluded.full_name);
  return new;
end;
$$ language plpgsql security definer;

-- 4. Re-create trigger
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 5. Backfill missing profiles (Safe Insert)
insert into public.profiles (id, email, role, created_at)
select 
  id, 
  email, 
  'user',
  created_at
from auth.users
where id not in (select id from public.profiles)
on conflict (id) do nothing;

-- 6. Update existing profiles that might have null email
update public.profiles p
set email = u.email
from auth.users u
where p.id = u.id and p.email is null;

-- 7. Policies
drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

drop policy if exists "Owners can view all profiles" on public.profiles;
create policy "Owners can view all profiles" on public.profiles for select using (
    exists ( select 1 from public.profiles where id = auth.uid() and role = 'owner' )
);

drop policy if exists "Owners can update all profiles" on public.profiles;
create policy "Owners can update all profiles" on public.profiles for update using (
    exists ( select 1 from public.profiles where id = auth.uid() and role = 'owner' )
);
