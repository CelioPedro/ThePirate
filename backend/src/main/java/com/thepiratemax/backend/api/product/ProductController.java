package com.thepiratemax.backend.api.product;

import com.thepiratemax.backend.service.product.ProductCatalogService;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductCatalogService productCatalogService;

    public ProductController(ProductCatalogService productCatalogService) {
        this.productCatalogService = productCatalogService;
    }

    @GetMapping
    public List<ProductResponse> listProducts() {
        return productCatalogService.listActiveProducts();
    }

    @GetMapping("/inventory")
    public List<ProductInventoryResponse> listInventory() {
        return productCatalogService.listInventory();
    }
}
