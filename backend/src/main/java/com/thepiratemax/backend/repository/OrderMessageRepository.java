package com.thepiratemax.backend.repository;

import com.thepiratemax.backend.domain.order.OrderMessageEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface OrderMessageRepository extends JpaRepository<OrderMessageEntity, UUID> {
    List<OrderMessageEntity> findAllByOrderIdOrderByCreatedAtAsc(UUID orderId);
}
