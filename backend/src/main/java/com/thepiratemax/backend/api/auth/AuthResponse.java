package com.thepiratemax.backend.api.auth;

import java.time.OffsetDateTime;
import java.util.UUID;

public record AuthResponse(
        String token,
        OffsetDateTime expiresAt,
        UserResponse user
) {

    public record UserResponse(
            UUID id,
            String email,
            String name,
            String role
    ) {
    }
}
