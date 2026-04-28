package com.thepiratemax.backend.bootstrap;

import com.thepiratemax.backend.domain.product.ProductCategory;
import com.thepiratemax.backend.domain.product.ProductProvider;

public record CatalogProductSeed(
        String sku,
        String slug,
        String name,
        String description,
        ProductCategory category,
        ProductProvider provider,
        long priceCents,
        int durationDays,
        String fulfillmentNotes,
        int stockCount
) {
}
