-- FIX: RLS Infinite Recursion
-- The previous policy caused an infinite loop because checking if a user is an owner
-- required reading the profiles table, which triggered the policy check again.

-- 1. Create a helper function to check role safely
-- SECURITY DEFINER = Runs as database admin (bypasses RLS)
create or replace function public.is_owner_secure()
returns boolean
language sql
security definer
set search_path = public -- Good security practice
as $$
  select exists (
    select 1 from profiles
    where id = auth.uid()
    and role = 'owner'
  );
$$;

-- 2. Replace the broken policies with the new safe version

-- View Policy
drop policy if exists "Owners can view all profiles" on public.profiles;
create policy "Owners can view all profiles" on public.profiles
  for select using (
    public.is_owner_secure()
  );

-- Update Policy
drop policy if exists "Owners can update all profiles" on public.profiles;
create policy "Owners can update all profiles" on public.profiles
  for update using (
    public.is_owner_secure()
  );
