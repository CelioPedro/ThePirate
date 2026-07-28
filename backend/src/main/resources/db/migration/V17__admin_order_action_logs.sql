create table admin_order_action_logs (
    id uuid primary key,
    admin_user_id uuid not null references users(id) on delete cascade,
    order_id uuid not null references orders(id) on delete cascade,
    action varchar(64) not null,
    reason varchar(1024) not null,
    previous_status varchar(64) not null,
    new_status varchar(64) not null,
    created_by_admin_at timestamp with time zone not null,
    created_at timestamp with time zone not null,
    updated_at timestamp with time zone not null
);

create index idx_admin_order_action_logs_admin_user_id on admin_order_action_logs(admin_user_id);
create index idx_admin_order_action_logs_order_id on admin_order_action_logs(order_id);
create index idx_admin_order_action_logs_created_by_admin_at on admin_order_action_logs(created_by_admin_at);
