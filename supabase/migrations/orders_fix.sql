-- Ensuring Orders Table Exists (Fix for PGRST205)

create table if not exists public.orders (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references auth.users not null,
  status text default 'pending', -- pending, paid, shipped, delivered, cancelled
  total decimal(10,2) not null,
  payment_id text,
  -- Shipping Info
  customer_name text,
  shipping_address text,
  city text,
  phone text,
  shipping_cost decimal(10,2) default 0
);

-- RLS for Orders
alter table public.orders enable row level security;

create policy "Users can view own orders" 
  on public.orders for select 
  using (auth.uid() = user_id);

create policy "Users can insert own orders" 
  on public.orders for insert 
  with check (auth.uid() = user_id);
