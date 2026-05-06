with seed_products (
    sku,
    slug,
    name,
    description,
    category,
    category_slug,
    provider,
    price_cents,
    duration_days,
    fulfillment_notes,
    image_url
) as (
    values
        ('TPM-ANTIGRAVITY-001', 'antigravity', 'Antigravity', 'Produto digital premium entregue por credencial.', 'ASSINATURA', 'assinaturas-premium', 'ANTIGRAVITY', 2599, 30, 'Entrega por credencial com operacao inicial de 30 dias.', '/catalog/products/antigravity.png')
)
insert into products (
    id,
    sku,
    slug,
    name,
    description,
    image_url,
    category_id,
    category,
    provider,
    status,
    price_cents,
    currency,
    region_code,
    duration_days,
    delivery_type,
    requires_stock,
    fulfillment_notes,
    created_at,
    updated_at
)
select
    gen_random_uuid(),
    seed_products.sku,
    seed_products.slug,
    seed_products.name,
    seed_products.description,
    seed_products.image_url,
    catalog_categories.id,
    seed_products.category,
    seed_products.provider,
    'ACTIVE',
    seed_products.price_cents,
    'BRL',
    'BR',
    seed_products.duration_days,
    'CREDENTIAL',
    true,
    seed_products.fulfillment_notes,
    now(),
    now()
from seed_products
join catalog_categories on catalog_categories.slug = seed_products.category_slug
on conflict (sku) do update set
    slug = excluded.slug,
    name = excluded.name,
    description = excluded.description,
    image_url = excluded.image_url,
    category_id = excluded.category_id,
    category = excluded.category,
    provider = excluded.provider,
    status = excluded.status,
    price_cents = excluded.price_cents,
    currency = excluded.currency,
    region_code = excluded.region_code,
    duration_days = excluded.duration_days,
    delivery_type = excluded.delivery_type,
    requires_stock = excluded.requires_stock,
    fulfillment_notes = excluded.fulfillment_notes,
    updated_at = now();
