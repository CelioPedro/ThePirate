package com.thepiratemax.backend.api.order;

import java.time.OffsetDateTime;
import java.util.UUID;

public record OrderMessageResponse(
        UUID id,
        UUID orderId,
        String senderRole,
        String content,
        OffsetDateTime createdAt
) {
}
