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
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class OrderExpirationService {

    private static final Logger logger = LoggerFactory.getLogger(OrderExpirationService.class);

    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final CredentialRepository credentialRepository;
    private final OrderStateService orderStateService;

    public OrderExpirationService(
            PaymentRepository paymentRepository,
            OrderRepository orderRepository,
            OrderItemRepository orderItemRepository,
            CredentialRepository credentialRepository,
            OrderStateService orderStateService
    ) {
        this.paymentRepository = paymentRepository;
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.credentialRepository = credentialRepository;
        this.orderStateService = orderStateService;
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

        orderStateService.markExpired(order, now);
        payment.setProviderStatus("expired");
        orderRepository.save(order);
        paymentRepository.save(payment);
        logger.info("event=order_expired orderId={} externalReference={} canceledAt={} paymentId={}",
                order.getId(), order.getExternalReference(), order.getCanceledAt(), payment.getId());
    }
}
