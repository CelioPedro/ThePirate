package com.thepiratemax.backend.api.admin;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.UUID;

public record CreateCredentialRequest(
        @NotNull UUID productId,
        @NotBlank @Size(max = 512) String login,
        @NotBlank @Size(max = 512) String password,
        @Size(max = 255) String sourceBatch
) {
}
