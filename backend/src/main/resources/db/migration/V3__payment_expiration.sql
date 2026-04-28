alter table payments add column if not exists pix_expires_at timestamp with time zone;

create index if not exists idx_payments_pix_expires_at on payments(pix_expires_at);
