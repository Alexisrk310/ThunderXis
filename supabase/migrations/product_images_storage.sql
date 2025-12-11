-- Create storage bucket for product images (only if it doesn't exist)
-- Note: Supabase doesn't have "IF NOT EXISTS" for buckets, so we use DO block
do $$
begin
  if not exists (
    select 1 from storage.buckets where id = 'product-images'
  ) then
    insert into storage.buckets (id, name, public)
    values ('product-images', 'product-images', true);
  end if;
end $$;

-- Drop existing policies if they exist
drop policy if exists "Allow authenticated uploads" on storage.objects;
drop policy if exists "Allow public read access" on storage.objects;
drop policy if exists "Allow authenticated deletes" on storage.objects;

-- Allow authenticated users to upload images
create policy "Allow authenticated uploads"
on storage.objects for insert
to authenticated
with check (bucket_id = 'product-images');

-- Allow public read access
create policy "Allow public read access"
on storage.objects for select
to public
using (bucket_id = 'product-images');

-- Allow authenticated users to delete their uploads
create policy "Allow authenticated deletes"
on storage.objects for delete
to authenticated
using (bucket_id = 'product-images');
