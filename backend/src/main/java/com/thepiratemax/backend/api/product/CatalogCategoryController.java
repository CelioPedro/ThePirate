package com.thepiratemax.backend.api.product;

import com.thepiratemax.backend.service.product.CatalogCategoryService;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/categories")
public class CatalogCategoryController {

    private final CatalogCategoryService catalogCategoryService;

    public CatalogCategoryController(CatalogCategoryService catalogCategoryService) {
        this.catalogCategoryService = catalogCategoryService;
    }

    @GetMapping
    public List<CatalogCategoryResponse> listCategories() {
        return catalogCategoryService.listActiveCategories();
    }

    @GetMapping("/home")
    public List<CatalogCategoryResponse> listHomeCategories() {
        return catalogCategoryService.listActiveCategories();
    }
}
