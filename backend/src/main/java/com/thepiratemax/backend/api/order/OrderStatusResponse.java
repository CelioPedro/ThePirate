package com.thepiratemax.backend.api.order;

import java.time.OffsetDateTime;
import java.util.UUID;

public record OrderStatusResponse(
        UUID orderId,
        String status,
        String failureReason,
        OffsetDateTime paidAt,
        OffsetDateTime deliveredAt
) {
}
