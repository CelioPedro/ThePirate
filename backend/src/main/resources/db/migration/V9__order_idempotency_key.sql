alter table orders
    add column idempotency_key varchar(120);

create unique index orders_user_id_idempotency_key_idx
    on orders (user_id, idempotency_key)
    where idempotency_key is not null;
