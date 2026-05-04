package com.thepiratemax.backend.service.product;

import com.thepiratemax.backend.api.product.ProductInventoryResponse;
import com.thepiratemax.backend.api.product.ProductResponse;
import com.thepiratemax.backend.domain.credential.CredentialStatus;
import com.thepiratemax.backend.domain.product.ProductEntity;
import com.thepiratemax.backend.domain.product.ProductStatus;
import com.thepiratemax.backend.repository.CredentialRepository;
import com.thepiratemax.backend.repository.ProductRepository;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ProductCatalogService {

    private final ProductRepository productRepository;
    private final CredentialRepository credentialRepository;

    public ProductCatalogService(ProductRepository productRepository, CredentialRepository credentialRepository) {
        this.productRepository = productRepository;
        this.credentialRepository = credentialRepository;
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> listActiveProducts() {
        List<ProductEntity> products = productRepository.findAllByStatusOrderByNameAsc(ProductStatus.ACTIVE);
        Map<UUID, Integer> stockByProductId = getStockByProductId(products);

        return products.stream()
                .map(product -> new ProductResponse(
                        product.getId(),
                        product.getSku(),
                        product.getSlug(),
                        product.getName(),
                        product.getDescription(),
                        product.getCategory().name(),
                        product.getProvider(),
                        product.getPriceCents(),
                        product.getCurrency(),
                        product.getRegionCode(),
                        product.getDurationDays(),
                        product.getFulfillmentNotes(),
                        product.isRequiresStock(),
                        stockByProductId.getOrDefault(product.getId(), 0)
                ))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ProductInventoryResponse> listInventory() {
        List<ProductEntity> products = productRepository.findAllByStatusOrderByNameAsc(ProductStatus.ACTIVE);
        Map<UUID, Integer> stockByProductId = getStockByProductId(products);

        return products.stream()
                .map(product -> new ProductInventoryResponse(
                        product.getSku(),
                        product.getSlug(),
                        product.getName(),
                        product.getProvider(),
                        product.getPriceCents(),
                        stockByProductId.getOrDefault(product.getId(), 0)
                ))
                .toList();
    }

    private Map<UUID, Integer> getStockByProductId(List<ProductEntity> products) {
        Map<UUID, Integer> stockByProductId = new HashMap<>();
        List<UUID> productIds = products.stream().map(ProductEntity::getId).toList();
        credentialRepository.countByProductIdsAndStatus(productIds, CredentialStatus.AVAILABLE)
                .forEach(row -> stockByProductId.put((UUID) row[0], ((Long) row[1]).intValue()));
        return stockByProductId;
    }
}
