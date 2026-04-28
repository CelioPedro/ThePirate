package com.thepiratemax.backend.api.product;

import java.util.UUID;

public record ProductResponse(
        UUID id,
        String sku,
        String slug,
        String name,
        String description,
        String category,
        String provider,
        long priceCents,
        String currency,
        String regionCode,
        int durationDays,
        String fulfillmentNotes,
        boolean requiresStock,
        int availableStock
) {
}
