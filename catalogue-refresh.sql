-- MahMah Naturals catalogue refresh
-- Run this once in Supabase SQL Editor after the product image files are present in the website repository.
-- This updates existing rows (the original schema uses ON CONFLICT DO NOTHING).

update public.products
set image = case id
  when 'shea-black-soap' then 'assets/products/shea-black-soap.jpg'
  when 'herbal-black-soap' then 'assets/products/herbal-black-soap.jpg'
  when 'black-soap-large' then 'assets/products/black-soap-large.jpg'
  when 'body-lotion' then 'assets/products/body-lotion.jpg'
  when 'body-butter' then 'assets/products/body-butter.jpg'
  when 'body-scrub-large' then 'assets/products/body-scrub-large.jpg'
  when 'face-cleanser' then 'assets/products/face-cleanser.jpg'
  when 'face-moisturiser' then 'assets/products/face-moisturiser.jpg'
  when 'face-toner' then 'assets/products/face-toner.jpg'
  when 'face-serum' then 'assets/products/face-serum.jpg'
  when 'face-oil' then 'assets/products/face-oil.jpg'
  when 'body-oil' then 'assets/products/body-oil.jpg'
  when 'shea-oil' then 'assets/products/shea-oil.jpg'
  when 'body-oil-large' then 'assets/products/body-oil-large.jpg'
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
