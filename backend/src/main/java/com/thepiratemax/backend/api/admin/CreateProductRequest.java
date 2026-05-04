package com.thepiratemax.backend.api.admin;

import com.thepiratemax.backend.domain.product.ProductCategory;
import com.thepiratemax.backend.domain.product.ProductStatus;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreateProductRequest(
        @NotBlank @Size(max = 255) String sku,
        @NotBlank @Size(max = 255) String slug,
        @NotBlank @Size(max = 255) String name,
        @Size(max = 4000) String description,
        @NotNull ProductCategory category,
        @NotBlank @Size(max = 255) String provider,
        @NotNull @Min(0) Long priceCents,
        @NotNull ProductStatus status,
        @NotNull @Min(0) Integer durationDays,
        @Size(max = 4000) String fulfillmentNotes
) {
}
