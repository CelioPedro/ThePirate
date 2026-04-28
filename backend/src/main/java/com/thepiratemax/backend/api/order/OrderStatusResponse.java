package com.thepiratemax.backend.api.order;

import java.time.OffsetDateTime;
import java.util.UUID;

public record OrderStatusResponse(
        UUID orderId,
        String status,
        OffsetDateTime paidAt,
        OffsetDateTime deliveredAt
) {
}
