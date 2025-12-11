-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Products Table
create table if not exists public.products (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  description text,
  price decimal(10,2) not null,
  image_url text,
  category text,
  stock integer default 0,
  features text[]
);

-- RLS for Products
alter table public.products enable row level security;

-- Drop existing policies if they exist to avoid conflicts
drop policy if exists "Public products are viewable by everyone" on public.products;
drop policy if exists "Admins can insert products" on public.products;
drop policy if exists "Admins can update products" on public.products;
drop policy if exists "Admins can delete products" on public.products;

-- Create policies
create policy "Public products are viewable by everyone" on public.products for select using (true);
create policy "Admins can insert products" on public.products for insert with check (auth.role() = 'authenticated');
create policy "Admins can update products" on public.products for update using (auth.role() = 'authenticated');
create policy "Admins can delete products" on public.products for delete using (auth.role() = 'authenticated');

-- Orders Table
create table if not exists public.orders (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references auth.users not null,
  status text default 'pending',
  total decimal(10,2) not null,
  payment_id text,
  customer_name text,
  shipping_address text,
  city text,
  phone text,
  shipping_cost decimal(10,2) default 0
);

-- Order Items Table
create table if not exists public.order_items (
  id uuid default uuid_generate_v4() primary key,
  order_id uuid references public.orders not null,
  product_id uuid references public.products not null,
  quantity integer not null,
  price_at_time decimal(10,2) not null
);

-- RLS for Orders
alter table public.orders enable row level security;

-- Drop existing order policies
drop policy if exists "Users can view own orders" on public.orders;
drop policy if exists "Users can insert own orders" on public.orders;

-- Create order policies
create policy "Users can view own orders" on public.orders for select using (auth.uid() = user_id);
create policy "Users can insert own orders" on public.orders for insert with check (auth.uid() = user_id);

-- RLS for Order Items
alter table public.order_items enable row level security;

-- Drop existing order_items policies
drop policy if exists "Users can view own order items" on public.order_items;

-- Create order_items policy
create policy "Users can view own order items" on public.order_items for select using (
  exists (select 1 from public.orders where id = public.order_items.order_id and user_id = auth.uid())
);
