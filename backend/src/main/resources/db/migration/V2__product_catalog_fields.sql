alter table products add column if not exists slug varchar(255);
alter table products add column if not exists category varchar(64);
alter table products add column if not exists provider varchar(64);
alter table products add column if not exists region_code varchar(8);
alter table products add column if not exists duration_days integer;
alter table products add column if not exists fulfillment_notes text;

update products
set
    slug = coalesce(slug, lower(replace(name, ' ', '-'))),
    category = coalesce(category, 'STREAMING'),
    provider = coalesce(provider, 'NETFLIX'),
    region_code = coalesce(region_code, 'BR'),
    duration_days = coalesce(duration_days, 30);

alter table products alter column slug set not null;
alter table products alter column category set not null;
alter table products alter column provider set not null;
alter table products alter column region_code set not null;
alter table products alter column duration_days set not null;

alter table products add constraint uk_products_slug unique (slug);

