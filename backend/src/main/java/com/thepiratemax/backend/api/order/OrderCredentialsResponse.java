package com.thepiratemax.backend.api.order;

import java.util.List;
import java.util.UUID;

public record OrderCredentialsResponse(
        UUID orderId,
        String status,
        List<CredentialResponse> credentials
) {

    public record CredentialResponse(
            UUID orderItemId,
            UUID productId,
            String productName,
            String login,
            String password
    ) {
    }
}
