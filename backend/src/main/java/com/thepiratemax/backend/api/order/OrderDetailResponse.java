package com.thepiratemax.backend.api.order;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public record OrderDetailResponse(
        UUID id,
        String status,
        String paymentMethod,
        long totalCents,
        String currency,
        OffsetDateTime createdAt,
        OffsetDateTime paidAt,
        OffsetDateTime deliveredAt,
        List<OrderItemDetailResponse> items
) {

    public record OrderItemDetailResponse(
            UUID id,
            UUID productId,
            String productName,
            int quantity,
            long unitPriceCents,
            long totalPriceCents
    ) {
    }
}
