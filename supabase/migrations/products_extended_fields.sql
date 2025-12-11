-- Update products table to match the Product entity
alter table products 
add column if not exists stock integer default 0,
add column if not exists gender text,
add column if not exists is_new boolean default false,
add column if not exists sizes jsonb default '[]'::jsonb,
add column if not exists colors jsonb default '[]'::jsonb;

-- Update image_url to images array
alter table products 
add column if not exists images jsonb default '[]'::jsonb;

-- Create index for better performance
create index if not exists idx_products_category on products(category);
create index if not exists idx_products_gender on products(gender);
