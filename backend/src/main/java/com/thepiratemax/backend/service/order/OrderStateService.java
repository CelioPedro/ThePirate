package com.thepiratemax.backend.service.order;

import com.thepiratemax.backend.domain.order.OrderEntity;
import com.thepiratemax.backend.domain.order.OrderStatus;
import com.thepiratemax.backend.service.exception.ConflictException;
import java.time.OffsetDateTime;
import org.springframework.stereotype.Service;

@Service
public class OrderStateService {

    public void markPaidFromWebhook(OrderEntity order, OffsetDateTime paidAt) {
        order.setPaidAt(paidAt);

        switch (order.getStatus()) {
            case PENDING -> {
                order.setStatus(OrderStatus.PAID);
                order.setFailureReason(null);
            }
            case CANCELED -> order.setFailureReason("APPROVED_AFTER_EXPIRATION");
            case PAID, DELIVERY_PENDING, DELIVERY_FAILED, DELIVERED, REFUNDED -> {
                // Keep current state; payment confirmation is already represented elsewhere.
            }
        }
    }

    public void moveToDeliveryPending(OrderEntity order) {
        if (order.getStatus() == OrderStatus.PAID || order.getStatus() == OrderStatus.DELIVERY_FAILED) {
            order.setStatus(OrderStatus.DELIVERY_PENDING);
            return;
        }

        if (order.getStatus() != OrderStatus.DELIVERY_PENDING) {
            throw new ConflictException(
                    "INVALID_ORDER_STATUS_TRANSITION",
                    "Order cannot move to DELIVERY_PENDING from status: " + order.getStatus().name()
            );
        }
    }

    public void markDeliveryFailed(OrderEntity order, String failureReason) {
        if (order.getStatus() == OrderStatus.PAID) {
            order.setStatus(OrderStatus.DELIVERY_PENDING);
        }

        if (order.getStatus() != OrderStatus.DELIVERY_PENDING && order.getStatus() != OrderStatus.DELIVERY_FAILED) {
            throw new ConflictException(
                    "INVALID_ORDER_STATUS_TRANSITION",
                    "Order cannot move to DELIVERY_FAILED from status: " + order.getStatus().name()
            );
        }

        order.setStatus(OrderStatus.DELIVERY_FAILED);
        order.setFailureReason(failureReason);
    }

    public void markDelivered(OrderEntity order, OffsetDateTime deliveredAt) {
        if (order.getStatus() == OrderStatus.PAID) {
            order.setStatus(OrderStatus.DELIVERY_PENDING);
        }

        if (order.getStatus() == OrderStatus.DELIVERED) {
            if (order.getDeliveredAt() == null) {
                order.setDeliveredAt(deliveredAt);
            }
            return;
        }

        if (order.getStatus() != OrderStatus.DELIVERY_PENDING) {
            throw new ConflictException(
                    "INVALID_ORDER_STATUS_TRANSITION",
                    "Order cannot move to DELIVERED from status: " + order.getStatus().name()
            );
        }

        order.setStatus(OrderStatus.DELIVERED);
        order.setDeliveredAt(deliveredAt);
        order.setFailureReason(null);
    }

    public void markExpired(OrderEntity order, OffsetDateTime canceledAt) {
        if (order.getStatus() != OrderStatus.PENDING && order.getStatus() != OrderStatus.CANCELED) {
            throw new ConflictException(
                    "INVALID_ORDER_STATUS_TRANSITION",
                    "Order cannot expire from status: " + order.getStatus().name()
            );
        }

        order.setStatus(OrderStatus.CANCELED);
        order.setCanceledAt(canceledAt);
        order.setFailureReason("PIX_EXPIRED");
    }
}
