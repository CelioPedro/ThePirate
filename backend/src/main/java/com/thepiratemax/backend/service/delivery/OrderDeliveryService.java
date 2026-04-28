package com.thepiratemax.backend.service.delivery;

import com.thepiratemax.backend.domain.credential.CredentialEntity;
import com.thepiratemax.backend.domain.credential.CredentialStatus;
import com.thepiratemax.backend.domain.order.OrderEntity;
import com.thepiratemax.backend.domain.order.OrderItemEntity;
import com.thepiratemax.backend.domain.order.OrderStatus;
import com.thepiratemax.backend.repository.CredentialRepository;
import com.thepiratemax.backend.repository.OrderItemRepository;
import com.thepiratemax.backend.repository.OrderRepository;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class OrderDeliveryService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final CredentialRepository credentialRepository;

    public OrderDeliveryService(
            OrderRepository orderRepository,
            OrderItemRepository orderItemRepository,
            CredentialRepository credentialRepository
    ) {
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.credentialRepository = credentialRepository;
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

        if (order.getStatus() == OrderStatus.PAID) {
            order.setStatus(OrderStatus.DELIVERY_PENDING);
        }

        boolean missingCredential = items.stream().anyMatch(item -> item.getCredential() == null);
        if (missingCredential) {
            order.setStatus(OrderStatus.DELIVERY_FAILED);
            orderRepository.save(order);
            return false;
        }

        OffsetDateTime deliveredAt = OffsetDateTime.now();
        for (OrderItemEntity item : items) {
            CredentialEntity credential = item.getCredential();
            if (credential.getStatus() == CredentialStatus.INVALID) {
                order.setStatus(OrderStatus.DELIVERY_FAILED);
                orderRepository.save(order);
                return false;
            }

            if (credential.getStatus() == CredentialStatus.RESERVED) {
                credential.setStatus(CredentialStatus.DELIVERED);
                credential.setDeliveredAt(deliveredAt);
                credentialRepository.save(credential);
            }
        }

        order.setStatus(OrderStatus.DELIVERED);
        order.setDeliveredAt(deliveredAt);
        orderRepository.save(order);
        return true;
    }
}
