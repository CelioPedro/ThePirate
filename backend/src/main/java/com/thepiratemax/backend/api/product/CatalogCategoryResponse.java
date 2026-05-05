package com.thepiratemax.backend.api.product;

import java.util.UUID;

public record CatalogCategoryResponse(
        UUID id,
        String name,
        String slug,
        String description,
        String imageUrl,
        int sortOrder,
        boolean active
) {
}
