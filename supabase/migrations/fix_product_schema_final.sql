-- Comprehensive Product Schema Fix
-- Ensures all necessary columns exist with correct types

-- 1. Basic Fields
alter table public.products 
add column if not exists description text,
add column if not exists category text,
add column if not exists image_url text;

-- 2. Extended Fields (Check existence and type)
-- We use 'text[]' for arrays mostly, but products_extended_fields used 'jsonb'.
-- To be safe and compatible with the code which sends arrays, we'll ensure they exist.
-- Ideally we stick to one. The code sends arrays. Postgres can handle array->jsonb if casted?
-- Let's stick to what previous migrations likely intended.
-- products_extended_fields.sql uses jsonb for sizes, colors, images.
-- schema.sql doesn't define them.

alter table public.products 
add column if not exists stock integer default 0,
add column if not exists gender text,
add column if not exists is_new boolean default false,
add column if not exists sale_price numeric default null;

-- 3. JSONB Arrays (Flexible for UI)
alter table public.products 
add column if not exists images jsonb default '[]'::jsonb,
add column if not exists sizes jsonb default '[]'::jsonb,
add column if not exists colors jsonb default '[]'::jsonb;

-- 4. Polices (Just in case)
alter table public.products enable row level security;

-- Ensure authenticated users can insert/update/delete (as per schema.sql)
drop policy if exists "Enable all access for authenticated users" on public.products;
create policy "Enable all access for authenticated users" on public.products
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- Public read access
drop policy if exists "Enable read access for all users" on public.products;
create policy "Enable read access for all users" on public.products
  for select using (true);
