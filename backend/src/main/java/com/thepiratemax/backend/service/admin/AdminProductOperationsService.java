package com.thepiratemax.backend.service.admin;

import com.thepiratemax.backend.api.admin.AdminProductResponse;
import com.thepiratemax.backend.api.admin.CreateProductRequest;
import com.thepiratemax.backend.api.admin.UpdateProductRequest;
import com.thepiratemax.backend.domain.product.DeliveryType;
import com.thepiratemax.backend.domain.credential.CredentialStatus;
import com.thepiratemax.backend.domain.product.ProductEntity;
import com.thepiratemax.backend.repository.CredentialRepository;
import com.thepiratemax.backend.repository.ProductRepository;
import com.thepiratemax.backend.service.exception.ConflictException;
import com.thepiratemax.backend.service.exception.NotFoundException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AdminProductOperationsService {

    private static final Logger logger = LoggerFactory.getLogger(AdminProductOperationsService.class);

    private final ProductRepository productRepository;
    private final CredentialRepository credentialRepository;

    public AdminProductOperationsService(ProductRepository productRepository, CredentialRepository credentialRepository) {
        this.productRepository = productRepository;
        this.credentialRepository = credentialRepository;
    }

    @Transactional(readOnly = true)
    public List<AdminProductResponse> listProducts() {
        List<ProductEntity> products = productRepository.findAllByOrderByNameAsc();
        Map<UUID, Integer> stockByProductId = getAvailableStockByProductId(products);
        return products.stream()
                .map(product -> toResponse(product, stockByProductId.getOrDefault(product.getId(), 0)))
                .toList();
    }

    @Transactional
    public AdminProductResponse createProduct(CreateProductRequest request) {
        String sku = request.sku().trim().toUpperCase();
        String slug = request.slug().trim().toLowerCase();

        productRepository.findBySku(sku).ifPresent(existing -> {
            throw new ConflictException("PRODUCT_SKU_ALREADY_EXISTS", "Product SKU already exists: " + sku);
        });
        productRepository.findBySlug(slug).ifPresent(existing -> {
            throw new ConflictException("PRODUCT_SLUG_ALREADY_EXISTS", "Product slug already exists: " + slug);
        });

        ProductEntity product = new ProductEntity();
        product.setSku(sku);
        product.setSlug(slug);
        product.setName(request.name().trim());
        product.setDescription(normalizeText(request.description()));
        product.setCategory(request.category());
        product.setProvider(normalizeRequiredText(request.provider()));
        product.setStatus(request.status());
        product.setPriceCents(request.priceCents());
        product.setCurrency("BRL");
        product.setRegionCode("BR");
        product.setDurationDays(request.durationDays());
        product.setDeliveryType(DeliveryType.CREDENTIAL);
        product.setRequiresStock(true);
        product.setFulfillmentNotes(normalizeText(request.fulfillmentNotes()));
        product = productRepository.save(product);

        logger.info("event=admin_product_created productId={} sku={} status={} priceCents={}",
                product.getId(), product.getSku(), product.getStatus(), product.getPriceCents());
        return toResponse(product, 0);
    }

    @Transactional
    public AdminProductResponse updateProduct(UUID productId, UpdateProductRequest request) {
        ProductEntity product = productRepository.findById(productId)
                .orElseThrow(() -> new NotFoundException("PRODUCT_NOT_FOUND", "Product not found: " + productId));

        product.setName(request.name().trim());
        product.setDescription(normalizeText(request.description()));
        product.setProvider(normalizeRequiredText(request.provider()));
        product.setPriceCents(request.priceCents());
        product.setStatus(request.status());
        product.setDurationDays(request.durationDays());
        product.setFulfillmentNotes(normalizeText(request.fulfillmentNotes()));
        product = productRepository.save(product);

        long availableStockCount = credentialRepository.countByProduct_IdAndStatus(product.getId(), CredentialStatus.AVAILABLE);
        int availableStock = availableStockCount > Integer.MAX_VALUE ? Integer.MAX_VALUE : (int) availableStockCount;
        logger.info("event=admin_product_updated productId={} sku={} status={} priceCents={}",
                product.getId(), product.getSku(), product.getStatus(), product.getPriceCents());
        return toResponse(product, availableStock);
    }

    private Map<UUID, Integer> getAvailableStockByProductId(List<ProductEntity> products) {
        Map<UUID, Integer> stockByProductId = new HashMap<>();
        List<UUID> productIds = products.stream().map(ProductEntity::getId).toList();
        if (productIds.isEmpty()) {
            return stockByProductId;
        }
        credentialRepository.countByProductIdsAndStatus(productIds, CredentialStatus.AVAILABLE)
                .forEach(row -> stockByProductId.put((UUID) row[0], ((Long) row[1]).intValue()));
        return stockByProductId;
    }

    private AdminProductResponse toResponse(ProductEntity product, int availableStock) {
        return new AdminProductResponse(
                product.getId(),
                product.getSku(),
                product.getSlug(),
                product.getName(),
                product.getDescription(),
                product.getCategory().name(),
                product.getProvider(),
                product.getStatus().name(),
                product.getPriceCents(),
                product.getCurrency(),
                product.getRegionCode(),
                product.getDurationDays(),
                product.getDeliveryType().name(),
                product.isRequiresStock(),
                product.getFulfillmentNotes(),
                availableStock
        );
    }

    private String normalizeText(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }

    private String normalizeRequiredText(String value) {
        return value.trim();
    }
}
