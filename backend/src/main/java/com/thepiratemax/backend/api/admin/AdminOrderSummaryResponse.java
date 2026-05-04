package com.thepiratemax.backend.api.admin;

import java.time.Instant;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public record AdminOrderSummaryResponse(
        UUID orderId,
        String externalReference,
        String status,
        String paymentMethod,
        long totalCents,
        String currency,
        Instant createdAt,
        OffsetDateTime paidAt,
        OffsetDateTime deliveredAt,
        OffsetDateTime canceledAt,
        String failureReason,
        CustomerSummaryResponse customer,
        List<ItemSummaryResponse> items
) {
    public record CustomerSummaryResponse(
            UUID userId,
            String name,
            String email
    ) {
    }

    public record ItemSummaryResponse(
            UUID productId,
            String productSku,
            String productName,
            int quantity
    ) {
    }
}
