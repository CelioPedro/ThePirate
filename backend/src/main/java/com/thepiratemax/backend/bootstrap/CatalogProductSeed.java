package com.thepiratemax.backend.bootstrap;

import com.thepiratemax.backend.domain.product.ProductCategory;
import com.thepiratemax.backend.domain.product.ProductProvider;

public record CatalogProductSeed(
        String sku,
        String slug,
        String name,
        String description,
        ProductCategory category,
        String provider,
        long priceCents,
        int durationDays,
        String fulfillmentNotes,
        int stockCount,
        String catalogCategorySlug,
        String imageUrl
) {
    public CatalogProductSeed(
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
        this(sku, slug, name, description, category, provider.name(), priceCents, durationDays, fulfillmentNotes, stockCount, null, null);
    }

    public CatalogProductSeed(
            String sku,
            String slug,
            String name,
            String description,
            ProductCategory category,
            ProductProvider provider,
            long priceCents,
            int durationDays,
            String fulfillmentNotes,
            int stockCount,
            String catalogCategorySlug,
            String imageUrl
    ) {
        this(sku, slug, name, description, category, provider.name(), priceCents, durationDays, fulfillmentNotes, stockCount, catalogCategorySlug, imageUrl);
    }

    public CatalogProductSeed(
            String sku,
            String slug,
            String name,
            String description,
            ProductCategory category,
            String provider,
            long priceCents,
            int durationDays,
            String fulfillmentNotes,
            int stockCount,
            String catalogCategorySlug,
            String imageUrl
    ) {
        this.sku = sku;
        this.slug = slug;
        this.name = name;
        this.description = description;
        this.category = category;
        this.provider = provider;
        this.priceCents = priceCents;
        this.durationDays = durationDays;
        this.fulfillmentNotes = fulfillmentNotes;
        this.stockCount = stockCount;
        this.catalogCategorySlug = catalogCategorySlug;
        this.imageUrl = imageUrl;
    }
}
