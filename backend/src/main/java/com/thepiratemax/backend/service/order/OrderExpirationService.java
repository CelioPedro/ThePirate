package com.thepiratemax.backend.service.order;

import com.thepiratemax.backend.domain.credential.CredentialEntity;
import com.thepiratemax.backend.domain.credential.CredentialStatus;
import com.thepiratemax.backend.domain.order.OrderEntity;
import com.thepiratemax.backend.domain.order.OrderItemEntity;
import com.thepiratemax.backend.domain.order.OrderStatus;
import com.thepiratemax.backend.domain.payment.PaymentEntity;
import com.thepiratemax.backend.repository.CredentialRepository;
import com.thepiratemax.backend.repository.OrderItemRepository;
import com.thepiratemax.backend.repository.OrderRepository;
import com.thepiratemax.backend.repository.PaymentRepository;
import java.time.OffsetDateTime;
import java.util.List;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class OrderExpirationService {

    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final CredentialRepository credentialRepository;

    public OrderExpirationService(
            PaymentRepository paymentRepository,
            OrderRepository orderRepository,
            OrderItemRepository orderItemRepository,
            CredentialRepository credentialRepository
    ) {
        this.paymentRepository = paymentRepository;
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.credentialRepository = credentialRepository;
    }

    @Scheduled(fixedDelayString = "${app.orders.expiration.scan-interval-ms:60000}")
    @Transactional
    public void expirePendingOrders() {
        expirePendingOrdersAt(OffsetDateTime.now());
    }

    @Transactional
    public int expirePendingOrdersAt(OffsetDateTime now) {
        List<PaymentEntity> expiredPayments = paymentRepository.findAllByPaidAtIsNullAndPixExpiresAtBeforeAndOrder_Status(
                now,
                OrderStatus.PENDING
        );

        for (PaymentEntity payment : expiredPayments) {
            expireOrder(payment.getOrder(), payment, now);
        }

        return expiredPayments.size();
    }

    private void expireOrder(OrderEntity order, PaymentEntity payment, OffsetDateTime now) {
        List<OrderItemEntity> items = orderItemRepository.findAllByOrderIdOrderByCreatedAtAsc(order.getId());
        for (OrderItemEntity item : items) {
            CredentialEntity credential = item.getCredential();
            if (credential != null && credential.getStatus() == CredentialStatus.RESERVED) {
                credential.setStatus(CredentialStatus.AVAILABLE);
                credential.setReservedAt(null);
                credentialRepository.save(credential);
            }
        }

        order.setStatus(OrderStatus.CANCELED);
        order.setCanceledAt(now);
        payment.setProviderStatus("expired");
        orderRepository.save(order);
        paymentRepository.save(payment);
    }
}
