-- Create Favorites Table
create table if not exists public.favorites (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references auth.users not null,
  product_id uuid not null, -- Stores ID from mock data (string) or real UUID if converted
  product_data jsonb -- Optional: Store snapshot of product data to avoid complex joins with mock data
);

-- RLS
alter table public.favorites enable row level security;

create policy "Users can view their own favorites" 
  on public.favorites for select 
  using (auth.uid() = user_id);

create policy "Users can insert their own favorites" 
  on public.favorites for insert 
  with check (auth.uid() = user_id);

create policy "Users can delete their own favorites" 
  on public.favorites for delete 
  using (auth.uid() = user_id);
