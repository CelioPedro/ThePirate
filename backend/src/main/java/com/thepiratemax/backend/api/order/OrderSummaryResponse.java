package com.thepiratemax.backend.api.order;

import java.time.OffsetDateTime;
import java.util.UUID;

public record OrderSummaryResponse(
        UUID id,
        String status,
        String paymentMethod,
        long totalCents,
        String currency,
        OffsetDateTime createdAt,
        OffsetDateTime paidAt,
        OffsetDateTime deliveredAt,
        OffsetDateTime canceledAt
) {
}
