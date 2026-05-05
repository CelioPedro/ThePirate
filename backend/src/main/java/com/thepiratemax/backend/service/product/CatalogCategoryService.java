package com.thepiratemax.backend.service.product;

import com.thepiratemax.backend.api.product.CatalogCategoryResponse;
import com.thepiratemax.backend.domain.product.CatalogCategoryEntity;
import com.thepiratemax.backend.repository.CatalogCategoryRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CatalogCategoryService {

    private final CatalogCategoryRepository catalogCategoryRepository;

    public CatalogCategoryService(CatalogCategoryRepository catalogCategoryRepository) {
        this.catalogCategoryRepository = catalogCategoryRepository;
    }

    @Transactional(readOnly = true)
    public List<CatalogCategoryResponse> listActiveCategories() {
        return catalogCategoryRepository.findAllByActiveTrueOrderBySortOrderAscNameAsc()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private CatalogCategoryResponse toResponse(CatalogCategoryEntity category) {
        return new CatalogCategoryResponse(
                category.getId(),
                category.getName(),
                category.getSlug(),
                category.getDescription(),
                category.getImageUrl(),
                category.getSortOrder(),
                category.isActive()
        );
    }
}
