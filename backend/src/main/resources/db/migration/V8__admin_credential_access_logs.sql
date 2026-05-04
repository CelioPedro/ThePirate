create table admin_credential_access_logs (
    id uuid primary key,
    admin_user_id uuid not null references users(id),
    credential_id uuid not null references credentials(id),
    action varchar(64) not null,
    accessed_at timestamp with time zone not null,
    ip_address varchar(255),
    user_agent varchar(512),
    created_at timestamp with time zone not null,
    updated_at timestamp with time zone not null
);

create index idx_admin_credential_access_logs_admin_user_id on admin_credential_access_logs(admin_user_id);
create index idx_admin_credential_access_logs_credential_id on admin_credential_access_logs(credential_id);
create index idx_admin_credential_access_logs_accessed_at on admin_credential_access_logs(accessed_at);
