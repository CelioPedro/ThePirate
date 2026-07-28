create table password_reset_tokens (
    id uuid primary key,
    user_id uuid not null references users(id) on delete cascade,
    token_hash varchar(128) not null unique,
    expires_at timestamp with time zone not null,
    used_at timestamp with time zone,
    requested_ip varchar(255),
    created_at timestamp with time zone not null,
    updated_at timestamp with time zone not null
);

create index idx_password_reset_tokens_user_id on password_reset_tokens(user_id);
create index idx_password_reset_tokens_expires_at on password_reset_tokens(expires_at);
create index idx_password_reset_tokens_used_at on password_reset_tokens(used_at);
