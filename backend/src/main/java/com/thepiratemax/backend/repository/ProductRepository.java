package com.thepiratemax.backend.repository;

import com.thepiratemax.backend.domain.product.ProductEntity;
import com.thepiratemax.backend.domain.product.ProductStatus;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductRepository extends JpaRepository<ProductEntity, UUID> {

    List<ProductEntity> findAllByIdInAndStatus(Collection<UUID> ids, ProductStatus status);

    List<ProductEntity> findAllByStatusOrderByNameAsc(ProductStatus status);

    Optional<ProductEntity> findBySku(String sku);
}
