package com.thepiratemax.backend.api.admin;

import com.thepiratemax.backend.service.admin.AdminProductOperationsService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/products")
public class AdminProductController {

    private final AdminProductOperationsService adminProductOperationsService;

    public AdminProductController(AdminProductOperationsService adminProductOperationsService) {
        this.adminProductOperationsService = adminProductOperationsService;
    }

    @GetMapping
    public List<AdminProductResponse> listProducts() {
        return adminProductOperationsService.listProducts();
    }

    @PostMapping
    public AdminProductResponse createProduct(@Valid @RequestBody CreateProductRequest request) {
        return adminProductOperationsService.createProduct(request);
    }

    @PutMapping("/{productId}")
    public AdminProductResponse updateProduct(
            @PathVariable UUID productId,
            @Valid @RequestBody UpdateProductRequest request
    ) {
        return adminProductOperationsService.updateProduct(productId, request);
    }
}
