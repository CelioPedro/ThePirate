package com.thepiratemax.backend.repository;

import com.thepiratemax.backend.domain.credential.CredentialEntity;
import com.thepiratemax.backend.domain.credential.CredentialStatus;
import java.util.Collection;
import java.util.List;
import java.util.UUID;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface CredentialRepository extends JpaRepository<CredentialEntity, UUID> {

    long countByProduct_Id(UUID productId);

    long countByProduct_IdAndStatus(UUID productId, CredentialStatus status);

    @Query("""
            select c.product.id, count(c)
            from CredentialEntity c
            where c.product.id in :productIds and c.status = :status
            group by c.product.id
            """)
    List<Object[]> countByProductIdsAndStatus(
            @Param("productIds") Collection<UUID> productIds,
            @Param("status") CredentialStatus status
    );

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    List<CredentialEntity> findByProduct_IdAndStatusOrderByCreatedAtAsc(
            UUID productId,
            CredentialStatus status,
            Pageable pageable
    );
}
