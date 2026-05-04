package com.thepiratemax.backend.repository;

import com.thepiratemax.backend.domain.order.OrderEntity;
import com.thepiratemax.backend.domain.order.OrderStatus;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderRepository extends JpaRepository<OrderEntity, UUID> {

    List<OrderEntity> findAllByUserIdOrderByCreatedAtDesc(UUID userId);

    List<OrderEntity> findAllByOrderByCreatedAtDesc(Pageable pageable);

    Optional<OrderEntity> findByIdAndUserId(UUID id, UUID userId);

    Optional<OrderEntity> findByUserIdAndIdempotencyKey(UUID userId, String idempotencyKey);

    List<OrderEntity> findAllByStatusInOrderByCreatedAtAsc(List<OrderStatus> statuses);
}
