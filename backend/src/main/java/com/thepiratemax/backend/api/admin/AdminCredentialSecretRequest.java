package com.thepiratemax.backend.api.admin;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AdminCredentialSecretRequest(
        @NotBlank @Size(max = 64) String action
) {
}
