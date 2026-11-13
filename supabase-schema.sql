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

-- Explicit API privileges; row-level security below restricts actual access.
grant usage on schema public to anon, authenticated;
grant select on public.products to anon, authenticated;
grant insert, update, delete on public.products to authenticated;
grant select on public.store_admins to authenticated;

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
('shea-black-soap','Shea Black Soap','soaps',6000,'A black soap option for your everyday cleansing routine.','','unavailable',2),
('herbal-black-soap','Herbal Black Soap','soaps',6000,'A herbal-inspired soap option. Ask the owner about its ingredients.','','unavailable',3),
('black-soap-large','Homemade Black Soap — Large','soaps',8500,'A larger-size option for your routine.','','unavailable',4),
('body-scrub','Body Scrub','body-care',5000,'A handmade body scrub from MahMah Naturals.','assets/mahmah-body-scrub.jpeg','available',5),
('body-lotion','Body Lotion','body-care',6000,'An everyday body-care option. Ask the owner about available variants.','','unavailable',6),
('body-butter','Body Butter','body-care',6000,'A rich-feel body moisturising option.','','unavailable',7),
('body-scrub-large','Body Scrub — Large','body-care',8500,'A larger-size body scrub option.','','unavailable',8),
('face-cleanser','Gentle Face Cleanser','skincare',6000,'A gentle daily face-cleansing option. Ask the owner about its ingredients and suitability.','','unavailable',9),
('face-moisturiser','Face Moisturiser','skincare',6000,'An everyday facial moisturising option.','','unavailable',10),
('face-toner','Facial Toner','skincare',6000,'A facial-care option to ask the owner about before adding to your routine.','','unavailable',11),
('face-serum','Face Serum','skincare',8500,'A facial-care product listing. Ask the owner about ingredients and use.','','unavailable',12),
('face-oil','Nourishing Face Oil','oils',6000,'A facial oil option. Ask the owner about its ingredients and intended use.','','unavailable',13),
('body-oil','Body Oil','oils',6000,'An oil option for your body-care routine.','','unavailable',14),
('shea-oil','Shea Oil','oils',6000,'A shea-based oil listing. Confirm ingredients with the owner.','','unavailable',15),
('body-oil-large','Body Oil — Large','oils',8500,'A larger-size body oil option.','','unavailable',16)
on conflict (id) do nothing;


-- Customer orders: customers may submit orders, but only store admins can read or update them.
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null check (char_length(trim(customer_name)) between 2 and 120),
  customer_phone text not null check (char_length(trim(customer_phone)) between 7 and 30),
  delivery_zone text not null check (delivery_zone in ('kaduna','kano','katsina','abuja')),
  delivery_address text not null check (char_length(trim(delivery_address)) between 8 and 500),
  items jsonb not null check (jsonb_typeof(items) = 'array' and jsonb_array_length(items) between 1 and 50),
  subtotal integer not null check (subtotal > 0),
  delivery_fee integer not null check (delivery_fee >= 0),
  total integer not null check (total = subtotal + delivery_fee),
  note text not null default '' check (char_length(note) <= 300),
  status text not null default 'pending' check (status in ('pending','confirmed','processing','dispatched','delivered','cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.orders enable row level security;
grant insert on public.orders to anon, authenticated;
grant select, update on public.orders to authenticated;

drop policy if exists "Customers can submit orders" on public.orders;
create policy "Customers can submit orders" on public.orders
  for insert to anon, authenticated
  with check (
    status = 'pending'
    and total = subtotal + delivery_fee
    and jsonb_typeof(items) = 'array'
    and jsonb_array_length(items) between 1 and 50
  );

drop policy if exists "Store admins can view orders" on public.orders;
create policy "Store admins can view orders" on public.orders
  for select to authenticated
  using (exists (select 1 from public.store_admins where user_id = auth.uid()));

drop policy if exists "Store admins can update orders" on public.orders;
create policy "Store admins can update orders" on public.orders
  for update to authenticated
  using (exists (select 1 from public.store_admins where user_id = auth.uid()))
  with check (
    exists (select 1 from public.store_admins where user_id = auth.uid())
    and status in ('pending','confirmed','processing','dispatched','delivered','cancelled')
  );

create index if not exists orders_created_at_idx on public.orders (created_at desc);
create index if not exists orders_status_idx on public.orders (status);


-- Secure customer order creation.
-- Customers submit product IDs and quantities only. Prices, availability, delivery
-- fees, item snapshots, and totals are calculated inside this trusted database function.
create or replace function public.create_customer_order(
  p_customer_name text,
  p_customer_phone text,
  p_delivery_zone text,
  p_delivery_address text,
  p_items jsonb,
  p_note text default ''
)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_zone_name text;
  v_delivery_fee integer;
  v_subtotal integer := 0;
  v_item jsonb;
  v_product record;
  v_quantity integer;
  v_order_items jsonb := '[]'::jsonb;
  v_order_id uuid;
begin
  if char_length(trim(coalesce(p_customer_name, ''))) not between 2 and 120 then
    raise exception 'Enter a valid customer name.';
  end if;
  if char_length(trim(coalesce(p_customer_phone, ''))) not between 7 and 30 then
    raise exception 'Enter a valid customer phone number.';
  end if;
  if char_length(trim(coalesce(p_delivery_address, ''))) not between 8 and 500 then
    raise exception 'Enter a delivery address with an area and useful landmark.';
  end if;
  if char_length(coalesce(p_note, '')) > 300 then
    raise exception 'The order note is too long.';
  end if;
  if jsonb_typeof(p_items) is distinct from 'array'
     or jsonb_array_length(p_items) not between 1 and 50 then
    raise exception 'Your bag is empty or contains too many items.';
  end if;

  case p_delivery_zone
    when 'kaduna' then v_zone_name := 'Kaduna State (all areas, including Zaria)'; v_delivery_fee := 1000;
    when 'kano' then v_zone_name := 'Kano State'; v_delivery_fee := 1500;
    when 'katsina' then v_zone_name := 'Katsina State'; v_delivery_fee := 2500;
    when 'abuja' then v_zone_name := 'Abuja (FCT)'; v_delivery_fee := 2000;
    else raise exception 'Choose one of the available delivery locations.';
  end case;

  for v_item in select value from jsonb_array_elements(p_items)
  loop
    if jsonb_typeof(v_item) is distinct from 'object'
       or jsonb_typeof(v_item->'id') is distinct from 'string'
       or jsonb_typeof(v_item->'quantity') is distinct from 'number' then
      raise exception 'An item in your bag could not be checked.';
    end if;

    if (v_item->>'quantity') !~ '^[0-9]+$' then
      raise exception 'An item quantity is invalid.';
    end if;
    v_quantity := (v_item->>'quantity')::integer;
    if v_quantity not between 1 and 99 then
      raise exception 'An item quantity is invalid.';
    end if;

    select id, name, price, status
      into v_product
      from public.products
      where id = v_item->>'id'
      for share;
    if not found or v_product.status <> 'available' then
      raise exception 'A selected product is no longer available. Please refresh your bag.';
    end if;

    v_subtotal := v_subtotal + (v_product.price * v_quantity);
    v_order_items := v_order_items || jsonb_build_array(jsonb_build_object(
      'id', v_product.id,
      'name', v_product.name,
      'quantity', v_quantity,
      'unit_price', v_product.price,
      'line_total', v_product.price * v_quantity
    ));
  end loop;

  insert into public.orders (
    customer_name, customer_phone, delivery_zone, delivery_address,
    items, subtotal, delivery_fee, total, note, status
  ) values (
    trim(p_customer_name), trim(p_customer_phone), p_delivery_zone, trim(p_delivery_address),
    v_order_items, v_subtotal, v_delivery_fee, v_subtotal + v_delivery_fee,
    coalesce(p_note, ''), 'pending'
  )
  returning id into v_order_id;

  return v_order_id;
end;
$$;

-- Remove direct customer inserts so callers cannot submit forged prices or totals.
revoke insert on public.orders from anon, authenticated;
revoke all on function public.create_customer_order(text, text, text, text, jsonb, text) from public;
grant execute on function public.create_customer_order(text, text, text, text, jsonb, text) to anon, authenticated;
