package com.thepiratemax.backend.api.order;

import java.time.Instant;
import java.time.OffsetDateTime;
import java.util.UUID;

public record CreateOrderResponse(
        OrderResponse order,
        PaymentResponse payment
) {

    public record OrderResponse(
            UUID id,
            String externalReference,
            String status,
            String paymentMethod,
            long totalCents,
            String currency,
            Instant createdAt
    ) {
    }

    public record PaymentResponse(
            String provider,
            String method,
            String qrCode,
            String copyPaste,
            OffsetDateTime expiresAt
    ) {
    }
}
