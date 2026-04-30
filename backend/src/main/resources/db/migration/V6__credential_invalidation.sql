alter table credentials
    add column invalidated_at timestamp with time zone,
    add column invalidation_reason varchar(512);

create index idx_credentials_invalidated_at on credentials(invalidated_at);
