package com.thepiratemax.backend.repository;

import com.thepiratemax.backend.domain.order.OrderItemEntity;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderItemRepository extends JpaRepository<OrderItemEntity, UUID> {

    List<OrderItemEntity> findAllByOrderIdOrderByCreatedAtAsc(UUID orderId);

    List<OrderItemEntity> findAllByOrderIdAndOrderUserIdOrderByCreatedAtAsc(UUID orderId, UUID userId);

    Optional<OrderItemEntity> findByIdAndOrderIdAndOrderUserId(UUID id, UUID orderId, UUID userId);
}
