package com.thepiratemax.backend.repository;

import com.thepiratemax.backend.domain.payment.PaymentEntity;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PaymentRepository extends JpaRepository<PaymentEntity, UUID> {

    Optional<PaymentEntity> findByOrder_ExternalReference(String externalReference);

    List<PaymentEntity> findAllByPaidAtIsNullAndPixExpiresAtBeforeAndOrder_Status(
            OffsetDateTime now,
            com.thepiratemax.backend.domain.order.OrderStatus orderStatus
    );
}
