-- V19__create_order_messages_table.sql

CREATE TABLE order_messages (
    id UUID PRIMARY KEY,
    order_id UUID NOT NULL REFERENCES orders(id),
    sender_role VARCHAR(20) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE INDEX idx_order_messages_order_id ON order_messages(order_id);
CREATE INDEX idx_order_messages_created_at ON order_messages(created_at);
