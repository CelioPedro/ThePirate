package com.thepiratemax.backend.api.order;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public record OrderDetailResponse(
        UUID id,
        String externalReference,
        String status,
        String failureReason,
        String paymentMethod,
        long totalCents,
        String currency,
        OffsetDateTime createdAt,
        OffsetDateTime paidAt,
        OffsetDateTime deliveredAt,
        PaymentDetailResponse payment,
        List<OrderItemDetailResponse> items
) {

    public record PaymentDetailResponse(
            String provider,
            String providerStatus,
            String providerPaymentId,
            String qrCode,
            String copyPaste,
            OffsetDateTime pixExpiresAt
    ) {
    }

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
