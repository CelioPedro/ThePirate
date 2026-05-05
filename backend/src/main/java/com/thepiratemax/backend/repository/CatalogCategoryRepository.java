package com.thepiratemax.backend.repository;

import com.thepiratemax.backend.domain.product.CatalogCategoryEntity;
import com.thepiratemax.backend.domain.product.ProductCategory;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CatalogCategoryRepository extends JpaRepository<CatalogCategoryEntity, UUID> {

    List<CatalogCategoryEntity> findAllByActiveTrueOrderBySortOrderAscNameAsc();

    Optional<CatalogCategoryEntity> findBySlug(String slug);

    Optional<CatalogCategoryEntity> findFirstByLegacyCategoryOrderBySortOrderAsc(ProductCategory legacyCategory);
}
