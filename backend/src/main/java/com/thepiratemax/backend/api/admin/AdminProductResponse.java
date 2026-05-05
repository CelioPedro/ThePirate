package com.thepiratemax.backend.api.admin;

import java.util.UUID;

public record AdminProductResponse(
        UUID id,
        String sku,
        String slug,
        String name,
        String description,
        String imageUrl,
        String category,
        UUID categoryId,
        String categorySlug,
        String categoryName,
        String categoryImageUrl,
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
