package com.thepiratemax.backend.service.delivery;

import com.thepiratemax.backend.domain.credential.CredentialEntity;
import com.thepiratemax.backend.domain.credential.CredentialStatus;
import com.thepiratemax.backend.domain.order.OrderEntity;
import com.thepiratemax.backend.domain.order.OrderItemEntity;
import com.thepiratemax.backend.domain.order.OrderStatus;
import com.thepiratemax.backend.repository.CredentialRepository;
import com.thepiratemax.backend.repository.OrderItemRepository;
import com.thepiratemax.backend.repository.OrderRepository;
import com.thepiratemax.backend.service.order.OrderStateService;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class OrderDeliveryService {

    private static final Logger logger = LoggerFactory.getLogger(OrderDeliveryService.class);

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final CredentialRepository credentialRepository;
    private final OrderStateService orderStateService;

    public OrderDeliveryService(
            OrderRepository orderRepository,
            OrderItemRepository orderItemRepository,
            CredentialRepository credentialRepository,
            OrderStateService orderStateService
    ) {
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.credentialRepository = credentialRepository;
        this.orderStateService = orderStateService;
    }

    @Scheduled(fixedDelayString = "${app.orders.delivery.scan-interval-ms:15000}")
    @Transactional
    public void processPendingDeliveries() {
        processPendingDeliveriesNow();
    }

    @Transactional
    public int processPendingDeliveriesNow() {
        List<OrderEntity> pendingOrders = orderRepository.findAllByStatusInOrderByCreatedAtAsc(
                List.of(OrderStatus.PAID, OrderStatus.DELIVERY_PENDING)
        );
        List<UUID> deliveredOrderIds = new ArrayList<>();
        pendingOrders.forEach(order -> {
            if (processOrder(order)) {
                deliveredOrderIds.add(order.getId());
            }
        });
        return deliveredOrderIds.size();
    }

    @Transactional
    public boolean processOrder(OrderEntity order) {
        List<OrderItemEntity> items = orderItemRepository.findAllByOrderIdOrderByCreatedAtAsc(order.getId());

        if (order.getStatus() == OrderStatus.DELIVERED) {
            return false;
        }

        orderStateService.moveToDeliveryPending(order);

        boolean missingCredential = items.stream().anyMatch(item -> item.getCredential() == null);
        if (missingCredential) {
            orderStateService.markDeliveryFailed(order, "MISSING_CREDENTIAL");
            orderRepository.save(order);
            logger.warn("event=delivery_failed orderId={} externalReference={} reason={}",
                    order.getId(), order.getExternalReference(), order.getFailureReason());
            return false;
        }

        OffsetDateTime deliveredAt = OffsetDateTime.now();
        for (OrderItemEntity item : items) {
            CredentialEntity credential = item.getCredential();
            if (credential.getStatus() == CredentialStatus.INVALID) {
                orderStateService.markDeliveryFailed(order, "INVALID_CREDENTIAL");
                orderRepository.save(order);
                logger.warn("event=delivery_failed orderId={} externalReference={} credentialId={} reason={}",
                        order.getId(), order.getExternalReference(), credential.getId(), order.getFailureReason());
                return false;
            }

            if (credential.getStatus() == CredentialStatus.RESERVED) {
                credential.setStatus(CredentialStatus.DELIVERED);
                credential.setDeliveredAt(deliveredAt);
                credentialRepository.save(credential);
            }
        }

        orderStateService.markDelivered(order, deliveredAt);
        orderRepository.save(order);
        logger.info("event=order_delivered orderId={} externalReference={} deliveredAt={} itemCount={}",
                order.getId(), order.getExternalReference(), order.getDeliveredAt(), items.size());
        return true;
    }
}
