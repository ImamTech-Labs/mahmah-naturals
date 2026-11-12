-- MahMah Naturals shared catalogue and owner-only management.
-- Run this entire script in Supabase SQL Editor after creating the project.
create table if not exists public.products (
  id text primary key,
  name text not null,
  category text not null check (category in ('skincare','body-care','soaps','oils')),
  price integer not null check (price > 0),
  description text not null default '',
  image text not null default '',
  status text not null default 'unavailable' check (status in ('available','unavailable')),
  sort_order integer not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists public.store_admins (
  user_id uuid primary key references auth.users(id) on delete cascade
);

alter table public.products enable row level security;
alter table public.store_admins enable row level security;

drop policy if exists "Anyone can read catalogue" on public.products;
create policy "Anyone can read catalogue" on public.products
  for select using (true);

drop policy if exists "Store admins can insert products" on public.products;
create policy "Store admins can insert products" on public.products
  for insert to authenticated
  with check (exists (select 1 from public.store_admins where user_id = auth.uid()));

drop policy if exists "Store admins can update products" on public.products;
create policy "Store admins can update products" on public.products
  for update to authenticated
  using (exists (select 1 from public.store_admins where user_id = auth.uid()))
  with check (exists (select 1 from public.store_admins where user_id = auth.uid()));

drop policy if exists "Store admins can delete products" on public.products;
create policy "Store admins can delete products" on public.products
  for delete to authenticated
  using (exists (select 1 from public.store_admins where user_id = auth.uid()));

drop policy if exists "Admins can read their own admin record" on public.store_admins;
create policy "Admins can read their own admin record" on public.store_admins
  for select to authenticated using (user_id = auth.uid());

-- After creating the owner account in Supabase Authentication > Users,
-- add its exact UUID here in the SQL editor:
-- insert into public.store_admins (user_id) values ('OWNER_AUTH_USER_UUID');

insert into public.products (id,name,category,price,description,image,status,sort_order) values
('black-soap','Homemade Black Soap','soaps',5000,'A handmade black soap from MahMah Naturals.','assets/mahmah-homemade-black-soap.jpeg','available',1),
('shea-black-soap','Shea Black Soap','soaps',6000,'A black soap option for your everyday cleansing routine.','','available',2),
('herbal-black-soap','Herbal Black Soap','soaps',6000,'A herbal-inspired soap option. Ask the owner about its ingredients.','','available',3),
('black-soap-large','Homemade Black Soap — Large','soaps',8500,'A larger-size option for your routine.','','available',4),
('body-scrub','Body Scrub','body-care',5000,'A handmade body scrub from MahMah Naturals.','assets/mahmah-body-scrub.jpeg','available',5),
('body-lotion','Body Lotion','body-care',6000,'An everyday body-care option. Ask the owner about available variants.','','available',6),
('body-butter','Body Butter','body-care',6000,'A rich-feel body moisturising option.','','available',7),
('body-scrub-large','Body Scrub — Large','body-care',8500,'A larger-size body scrub option.','','available',8),
('face-cleanser','Gentle Face Cleanser','skincare',6000,'A gentle daily face-cleansing option. Ask the owner about its ingredients and suitability.','','available',9),
('face-moisturiser','Face Moisturiser','skincare',6000,'An everyday facial moisturising option.','','available',10),
('face-toner','Facial Toner','skincare',6000,'A facial-care option to ask the owner about before adding to your routine.','','available',11),
('face-serum','Face Serum','skincare',8500,'A facial-care product listing. Ask the owner about ingredients and use.','','available',12),
('face-oil','Nourishing Face Oil','oils',6000,'A facial oil option. Ask the owner about its ingredients and intended use.','','available',13),
('body-oil','Body Oil','oils',6000,'An oil option for your body-care routine.','','available',14),
('shea-oil','Shea Oil','oils',6000,'A shea-based oil listing. Confirm ingredients with the owner.','','available',15),
('body-oil-large','Body Oil — Large','oils',8500,'A larger-size body oil option.','','available',16)
on conflict (id) do nothing;
