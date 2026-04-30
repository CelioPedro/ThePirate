package com.thepiratemax.backend.api.admin;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record InvalidateCredentialRequest(
        @NotBlank @Size(max = 512) String reason
) {
}
