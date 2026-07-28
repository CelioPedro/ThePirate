package com.thepiratemax.backend.api.auth;

import java.time.Instant;

public record PasswordResetResponse(
        String status,
        Instant expiresAt,
        String resetToken
) {
}
