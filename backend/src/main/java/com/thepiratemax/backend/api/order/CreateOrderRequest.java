package com.thepiratemax.backend.api.order;

import com.thepiratemax.backend.domain.order.PaymentMethod;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.List;
import java.util.UUID;

public record CreateOrderRequest(
        @NotEmpty(message = "Items must not be empty")
        List<@Valid OrderItemRequest> items,
        @NotNull(message = "Payment method is required")
        PaymentMethod paymentMethod,
        @Size(max = 120, message = "Idempotency key must have at most 120 characters")
        String idempotencyKey
) {

    public record OrderItemRequest(
            @NotNull(message = "Product id is required")
            UUID productId,
            @Min(value = 1, message = "Quantity must be at least 1")
            int quantity
    ) {
    }
}
