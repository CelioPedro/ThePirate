alter table order_items
    drop constraint if exists order_items_credential_id_key;

create index if not exists idx_order_items_credential_id on order_items(credential_id);
