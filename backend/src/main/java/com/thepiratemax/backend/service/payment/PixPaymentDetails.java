package com.thepiratemax.backend.service.payment;

import java.time.OffsetDateTime;

public record PixPaymentDetails(
        String providerPaymentId,
        String qrCode,
        String copyPaste,
        OffsetDateTime expiresAt,
        String providerStatus,
        String providerPayload
) {
}
