package com.thepiratemax.backend.api.admin;

import java.time.Instant;
import java.time.OffsetDateTime;
import java.util.UUID;

public record AdminCredentialResponse(
        UUID credentialId,
        UUID productId,
        String productSku,
        String productName,
        String status,
        String login,
        String password,
        String sourceBatch,
        Instant createdAt,
        OffsetDateTime reservedAt,
        OffsetDateTime deliveredAt,
        OffsetDateTime invalidatedAt,
        String invalidationReason
) {
}
