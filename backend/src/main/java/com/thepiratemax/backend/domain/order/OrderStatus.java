package com.thepiratemax.backend.domain.order;

public enum OrderStatus {
    PENDING,
    PAID,
    DELIVERY_PENDING,
    DELIVERED,
    DELIVERY_FAILED,
    PAYMENT_REVIEW,
    CANCELED,
    REFUNDED
}
