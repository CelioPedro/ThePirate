package com.thepiratemax.backend.service.admin;

import com.thepiratemax.backend.api.admin.AdminOrderDiagnosticsResponse;
import com.thepiratemax.backend.api.order.OrderStatusResponse;
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
import com.thepiratemax.backend.service.delivery.OrderDeliveryService;
import com.thepiratemax.backend.service.exception.ConflictException;
import com.thepiratemax.backend.service.exception.NotFoundException;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AdminOrderOperationsService {

    private static final Logger logger = LoggerFactory.getLogger(AdminOrderOperationsService.class);

    private static final Set<OrderStatus> REPROCESSABLE_DELIVERY_STATUSES = Set.of(
            OrderStatus.PAID,
            OrderStatus.DELIVERY_PENDING,
            OrderStatus.DELIVERY_FAILED
    );
    private static final Set<OrderStatus> RELEASABLE_RESERVATION_STATUSES = Set.of(
            OrderStatus.PENDING,
            OrderStatus.CANCELED
    );

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final CredentialRepository credentialRepository;
    private final PaymentRepository paymentRepository;
    private final OrderDeliveryService orderDeliveryService;

    public AdminOrderOperationsService(
            OrderRepository orderRepository,
            OrderItemRepository orderItemRepository,
            CredentialRepository credentialRepository,
            PaymentRepository paymentRepository,
            OrderDeliveryService orderDeliveryService
    ) {
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.credentialRepository = credentialRepository;
        this.paymentRepository = paymentRepository;
        this.orderDeliveryService = orderDeliveryService;
    }

    @Transactional
    public OrderStatusResponse reprocessDelivery(UUID orderId) {
        OrderEntity order = orderRepository.findById(orderId)
                .orElseThrow(() -> new NotFoundException("ORDER_NOT_FOUND", "Order not found: " + orderId));

        if (!REPROCESSABLE_DELIVERY_STATUSES.contains(order.getStatus())) {
            throw new ConflictException(
                    "ORDER_NOT_REPROCESSABLE",
                    "Order cannot be reprocessed from status: " + order.getStatus().name()
            );
        }

        orderDeliveryService.processOrder(order);
        logger.info("event=admin_reprocess_delivery orderId={} externalReference={} newStatus={} failureReason={}",
                order.getId(), order.getExternalReference(), order.getStatus().name(), order.getFailureReason());

        return new OrderStatusResponse(
                order.getId(),
                order.getStatus().name(),
                order.getFailureReason(),
                order.getPaidAt(),
                order.getDeliveredAt()
        );
    }

    @Transactional
    public OrderStatusResponse releaseReservation(UUID orderId) {
        OrderEntity order = orderRepository.findById(orderId)
                .orElseThrow(() -> new NotFoundException("ORDER_NOT_FOUND", "Order not found: " + orderId));

        if (!RELEASABLE_RESERVATION_STATUSES.contains(order.getStatus())) {
            throw new ConflictException(
                    "ORDER_RESERVATION_NOT_RELEASABLE",
                    "Reservation cannot be released from status: " + order.getStatus().name()
            );
        }

        List<OrderItemEntity> items = orderItemRepository.findAllByOrderIdOrderByCreatedAtAsc(orderId);
        for (OrderItemEntity item : items) {
            CredentialEntity credential = item.getCredential();
            if (credential != null && credential.getStatus() == CredentialStatus.RESERVED) {
                credential.setStatus(CredentialStatus.AVAILABLE);
                credential.setReservedAt(null);
                credentialRepository.save(credential);
            }
        }

        order.setFailureReason(null);
        orderRepository.save(order);
        logger.info("event=admin_release_reservation orderId={} externalReference={} itemCount={}",
                order.getId(), order.getExternalReference(), items.size());

        return new OrderStatusResponse(
                order.getId(),
                order.getStatus().name(),
                order.getFailureReason(),
                order.getPaidAt(),
                order.getDeliveredAt()
        );
    }

    @Transactional(readOnly = true)
    public AdminOrderDiagnosticsResponse getDiagnostics(UUID orderId) {
        OrderEntity order = orderRepository.findById(orderId)
                .orElseThrow(() -> new NotFoundException("ORDER_NOT_FOUND", "Order not found: " + orderId));

        PaymentEntity payment = paymentRepository.findByOrder_Id(orderId)
                .orElseThrow(() -> new NotFoundException("PAYMENT_NOT_FOUND", "Payment not found for order: " + orderId));

        List<OrderItemEntity> items = orderItemRepository.findAllByOrderIdOrderByCreatedAtAsc(orderId);
        logger.info("event=admin_order_diagnostics orderId={} externalReference={} orderStatus={}",
                order.getId(), order.getExternalReference(), order.getStatus().name());

        return new AdminOrderDiagnosticsResponse(
                order.getId(),
                order.getExternalReference(),
                order.getStatus().name(),
                order.getFailureReason(),
                order.getPaymentMethod().name(),
                order.getTotalCents(),
                order.getCurrency(),
                order.getCreatedAt().atOffset(java.time.OffsetDateTime.now().getOffset()),
                order.getPaidAt(),
                order.getDeliveredAt(),
                order.getCanceledAt(),
                new AdminOrderDiagnosticsResponse.PaymentDiagnosticsResponse(
                        payment.getProvider().name(),
                        payment.getProviderStatus(),
                        payment.getProviderPaymentId(),
                        payment.getAmountCents(),
                        payment.getPaidAt(),
                        payment.getPixExpiresAt()
                ),
                items.stream()
                        .map(item -> {
                            CredentialEntity credential = item.getCredential();
                            return new AdminOrderDiagnosticsResponse.ItemDiagnosticsResponse(
                                    item.getId(),
                                    item.getProduct().getId(),
                                    item.getProduct().getSku(),
                                    item.getProduct().getName(),
                                    credential != null ? credential.getId() : null,
                                    credential != null ? credential.getStatus().name() : null,
                                    credential != null ? credential.getSourceBatch() : null,
                                    credential != null ? credential.getReservedAt() : null,
                                    credential != null ? credential.getDeliveredAt() : null
                            );
                        })
                        .toList()
        );
    }
}
