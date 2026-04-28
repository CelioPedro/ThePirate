package com.thepiratemax.backend.api.product;

public record ProductInventoryResponse(
        String sku,
        String slug,
        String name,
        String provider,
        long priceCents,
        int availableStock
) {
}

