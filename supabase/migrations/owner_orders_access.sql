-- Drop existing policies if they exist
drop policy if exists "Owners can view all orders" on public.orders;
drop policy if exists "Owners can update orders" on public.orders;

-- Allow owners to view all orders for dashboard analytics
create policy "Owners can view all orders"
on public.orders for select
to authenticated
using (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid()
    and profiles.role = 'owner'
  )
);

-- Allow owners to update order status
create policy "Owners can update orders"
on public.orders for update
to authenticated
using (
  exists (
    select 1 from public.profiles
    where profiles.id = auth.uid()
    and profiles.role = 'owner'
  )
);
