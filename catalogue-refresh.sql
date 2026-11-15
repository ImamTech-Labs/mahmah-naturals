-- MahMah Naturals catalogue refresh
-- Run this once in Supabase SQL Editor after the product image files are present in the website repository.
-- This updates existing rows (the original schema uses ON CONFLICT DO NOTHING).

update public.products
set image = case id
  when 'shea-black-soap' then 'assets/products/shea-black-soap.svg'
  when 'herbal-black-soap' then 'assets/products/herbal-black-soap.svg'
  when 'black-soap-large' then 'assets/products/black-soap-large.svg'
  when 'body-lotion' then 'assets/products/body-lotion.svg'
  when 'body-butter' then 'assets/products/body-butter.svg'
  when 'body-scrub-large' then 'assets/products/body-scrub-large.svg'
  when 'face-cleanser' then 'assets/products/face-cleanser.svg'
  when 'face-moisturiser' then 'assets/products/face-moisturiser.svg'
  when 'face-toner' then 'assets/products/face-toner.svg'
  when 'face-serum' then 'assets/products/face-serum.svg'
  when 'face-oil' then 'assets/products/face-oil.svg'
  when 'body-oil' then 'assets/products/body-oil.svg'
  when 'shea-oil' then 'assets/products/shea-oil.svg'
  when 'body-oil-large' then 'assets/products/body-oil-large.svg'
  else image
end,
status = 'available',
updated_at = now()
where id in (
  'black-soap','shea-black-soap','herbal-black-soap','black-soap-large',
  'body-scrub','body-lotion','body-butter','body-scrub-large',
  'face-cleanser','face-moisturiser','face-toner','face-serum',
  'face-oil','body-oil','shea-oil','body-oil-large'
);
