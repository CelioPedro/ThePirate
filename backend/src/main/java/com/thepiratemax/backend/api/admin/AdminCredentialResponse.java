package com.thepiratemax.backend.api.admin;

import java.time.OffsetDateTime;
import java.util.UUID;

public record AdminCredentialResponse(
        UUID credentialId,
        UUID productId,
        String productSku,
        String status,
        String sourceBatch,
        OffsetDateTime reservedAt,
        OffsetDateTime deliveredAt,
        OffsetDateTime invalidatedAt,
        String invalidationReason
) {
}
