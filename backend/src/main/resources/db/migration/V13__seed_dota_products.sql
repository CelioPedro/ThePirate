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
        ('TPM-DOTA-ANCIENT-001', 'dota-ancient', 'Conta Dota Ancient', 'Conta de Dota 2 pronta para uso em tier Ancient.', 'GAMES', 'games', 'DOTA_2', 18990, 0, 'Entrega de conta individual com troca imediata de acesso recomendada.', '/catalog/products/dota.png'),
        ('TPM-DOTA-DIVINE-001', 'dota-divine', 'Conta Dota Divine', 'Conta de Dota 2 pronta para uso em tier Divine.', 'GAMES', 'games', 'DOTA_2', 28990, 0, 'Entrega de conta individual com troca imediata de acesso recomendada.', '/catalog/products/dota.png'),
        ('TPM-DOTA-IMMORTAL-001', 'dota-immortal', 'Conta Dota Immortal', 'Conta de Dota 2 pronta para uso em tier Immortal.', 'GAMES', 'games', 'DOTA_2', 49990, 0, 'Entrega de conta individual com prioridade operacional.', '/catalog/products/dota.png')
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
