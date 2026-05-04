package com.thepiratemax.backend.api.admin;

import java.util.UUID;

public record AdminCredentialSecretResponse(
        UUID credentialId,
        String login,
        String password
) {
}
