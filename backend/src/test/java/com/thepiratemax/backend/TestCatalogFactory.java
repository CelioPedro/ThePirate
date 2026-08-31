package com.thepiratemax.backend;

import com.thepiratemax.backend.domain.product.CatalogCategoryEntity;
import com.thepiratemax.backend.domain.product.ProductCategory;
import com.thepiratemax.backend.repository.CatalogCategoryRepository;

public final class TestCatalogFactory {

    private TestCatalogFactory() {
    }

    public static CatalogCategoryEntity catalogCategory(
            CatalogCategoryRepository repository,
            ProductCategory legacyCategory
    ) {
        String slug = switch (legacyCategory) {
            case STREAMING -> "streaming";
            case GAMES -> "games";
            case ASSINATURA -> "assinaturas-premium";
            case IA -> "inteligencia-artificial";
        };

        return repository.findBySlug(slug)
                .orElseGet(() -> repository.save(buildCategory(slug, legacyCategory)));
    }

    private static CatalogCategoryEntity buildCategory(String slug, ProductCategory legacyCategory) {
        CatalogCategoryEntity category = new CatalogCategoryEntity();
        category.setName("Test " + legacyCategory.name());
        category.setSlug(slug);
        category.setDescription("Test catalog category");
        category.setSortOrder(1);
        category.setActive(true);
        category.setLegacyCategory(legacyCategory);
        return category;
    }
}
