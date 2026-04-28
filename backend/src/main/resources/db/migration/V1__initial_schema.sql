create extension if not exists "pgcrypto";

create table users (
    id uuid primary key,
    email varchar(255) not null unique,
    password_hash varchar(255),
    name varchar(255),
    status varchar(64) not null,
    created_at timestamp with time zone not null,
    updated_at timestamp with time zone not null
);

create table products (
    id uuid primary key,
    sku varchar(255) not null unique,
    name varchar(255) not null,
    description text,
    status varchar(64) not null,
    price_cents bigint not null,
    currency varchar(3) not null,
    delivery_type varchar(64) not null,
    requires_stock boolean not null,
    created_at timestamp with time zone not null,
    updated_at timestamp with time zone not null
);

create table credentials (
    id uuid primary key,
    product_id uuid not null references products(id),
    login_encrypted text not null,
    password_encrypted text not null,
    encryption_key_version varchar(255) not null,
    status varchar(64) not null,
    source_batch varchar(255),
    reserved_at timestamp with time zone,
    delivered_at timestamp with time zone,
    created_at timestamp with time zone not null,
    updated_at timestamp with time zone not null
);

create table orders (
    id uuid primary key,
    user_id uuid not null references users(id),
    status varchar(64) not null,
    payment_method varchar(64) not null,
    subtotal_cents bigint not null,
    total_cents bigint not null,
    currency varchar(3) not null,
    external_reference varchar(255) not null unique,
    paid_at timestamp with time zone,
    delivered_at timestamp with time zone,
    canceled_at timestamp with time zone,
    created_at timestamp with time zone not null,
    updated_at timestamp with time zone not null
);

create table payments (
    id uuid primary key,
    order_id uuid not null references orders(id),
    provider varchar(64) not null,
    provider_payment_id varchar(255) unique,
    provider_status varchar(255),
    payment_method varchar(64) not null,
    amount_cents bigint not null,
    currency varchar(3) not null,
    pix_qr_code text,
    pix_copy_paste text,
    provider_payload text,
    paid_at timestamp with time zone,
    created_at timestamp with time zone not null,
    updated_at timestamp with time zone not null
);

create table order_items (
    id uuid primary key,
    order_id uuid not null references orders(id),
    product_id uuid not null references products(id),
    credential_id uuid unique references credentials(id),
    quantity integer not null,
    unit_price_cents bigint not null,
    total_price_cents bigint not null,
    created_at timestamp with time zone not null,
    updated_at timestamp with time zone not null
);

create table webhook_events (
    id uuid primary key,
    provider varchar(255) not null,
    event_type varchar(255),
    provider_event_id varchar(255),
    signature_valid boolean not null,
    payload text not null,
    processed boolean not null,
    processed_at timestamp with time zone,
    created_at timestamp with time zone not null,
    updated_at timestamp with time zone not null
);

create table credential_views (
    id uuid primary key,
    user_id uuid not null references users(id),
    order_id uuid not null references orders(id),
    order_item_id uuid not null references order_items(id),
    viewed_at timestamp with time zone not null,
    ip_address varchar(255),
    user_agent varchar(512),
    created_at timestamp with time zone not null,
    updated_at timestamp with time zone not null
);

create index idx_credentials_product_status on credentials(product_id, status);
create index idx_orders_user_id on orders(user_id);
create index idx_orders_status on orders(status);
create index idx_orders_created_at on orders(created_at);
create index idx_payments_order_id on payments(order_id);
create index idx_payments_provider_status on payments(provider_status);
create index idx_webhook_events_provider on webhook_events(provider);
create index idx_webhook_events_provider_event_id on webhook_events(provider_event_id);
create index idx_webhook_events_processed on webhook_events(processed);
create index idx_credential_views_user_id on credential_views(user_id);
create index idx_credential_views_order_id on credential_views(order_id);
create index idx_credential_views_viewed_at on credential_views(viewed_at);

