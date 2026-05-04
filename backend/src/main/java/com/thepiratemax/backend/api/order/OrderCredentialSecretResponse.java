package com.thepiratemax.backend.api.order;

import java.util.UUID;

public record OrderCredentialSecretResponse(
        UUID orderId,
        UUID orderItemId,
        UUID productId,
        String productName,
        String login,
        String password
) {
}
