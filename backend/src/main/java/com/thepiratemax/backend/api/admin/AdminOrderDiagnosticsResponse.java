package com.thepiratemax.backend.api.admin;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public record AdminOrderDiagnosticsResponse(
        UUID orderId,
        String externalReference,
        String orderStatus,
        String failureReason,
        String paymentMethod,
        long totalCents,
        String currency,
        OffsetDateTime createdAt,
        OffsetDateTime paidAt,
        OffsetDateTime deliveredAt,
        OffsetDateTime canceledAt,
        PaymentDiagnosticsResponse payment,
        List<ItemDiagnosticsResponse> items
) {

    public record PaymentDiagnosticsResponse(
            String provider,
            String providerStatus,
            String providerPaymentId,
            long amountCents,
            OffsetDateTime paidAt,
            OffsetDateTime pixExpiresAt
    ) {
    }

    public record ItemDiagnosticsResponse(
            UUID orderItemId,
            UUID productId,
            String productSku,
            String productName,
            UUID credentialId,
            String credentialStatus,
            String sourceBatch,
            OffsetDateTime reservedAt,
            OffsetDateTime deliveredAt
    ) {
    }
}
