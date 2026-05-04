package com.thepiratemax.backend.api.admin;

import java.util.UUID;

public record AdminProductResponse(
        UUID id,
        String sku,
        String slug,
        String name,
        String description,
        String category,
        String provider,
        String status,
        long priceCents,
        String currency,
        String regionCode,
        int durationDays,
        String deliveryType,
        boolean requiresStock,
        String fulfillmentNotes,
        int availableStock
) {
}
