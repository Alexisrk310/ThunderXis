alter table products 
add column if not exists is_new boolean default false,
add column if not exists sale_price numeric default null;
