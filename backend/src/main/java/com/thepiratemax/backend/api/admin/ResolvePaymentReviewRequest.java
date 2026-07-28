package com.thepiratemax.backend.api.admin;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record ResolvePaymentReviewRequest(
        @NotBlank(message = "Action is required")
        @Pattern(regexp = "DELIVER|REFUND", message = "Action must be DELIVER or REFUND")
        String action,

        @NotBlank(message = "Reason is required")
        @Size(max = 1000, message = "Reason must have at most 1000 characters")
        String reason
) {
}
