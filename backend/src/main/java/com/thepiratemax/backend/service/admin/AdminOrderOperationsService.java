package com.thepiratemax.backend.service.admin;

import com.thepiratemax.backend.api.admin.AdminOrderDiagnosticsResponse;
import com.thepiratemax.backend.api.admin.AdminOrderSummaryResponse;
import com.thepiratemax.backend.api.admin.ResolvePaymentReviewRequest;
import com.thepiratemax.backend.api.order.OrderStatusResponse;
import com.thepiratemax.backend.domain.audit.AdminOrderActionLogEntity;
import com.thepiratemax.backend.domain.credential.CredentialEntity;
import com.thepiratemax.backend.domain.credential.CredentialStatus;
import com.thepiratemax.backend.domain.order.OrderEntity;
import com.thepiratemax.backend.domain.order.OrderItemEntity;
import com.thepiratemax.backend.domain.order.OrderStatus;
import com.thepiratemax.backend.domain.payment.PaymentEntity;
import com.thepiratemax.backend.repository.AdminOrderActionLogRepository;
import com.thepiratemax.backend.repository.CredentialRepository;
import com.thepiratemax.backend.repository.OrderItemRepository;
import com.thepiratemax.backend.repository.OrderRepository;
import com.thepiratemax.backend.repository.PaymentRepository;
import com.thepiratemax.backend.service.delivery.OrderDeliveryService;
import com.thepiratemax.backend.service.auth.CurrentUserProvider;
import com.thepiratemax.backend.service.exception.ConflictException;
import com.thepiratemax.backend.service.exception.NotFoundException;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.PageRequest;
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
    private final CurrentUserProvider currentUserProvider;
    private final AdminOrderActionLogRepository adminOrderActionLogRepository;

    public AdminOrderOperationsService(
            OrderRepository orderRepository,
            OrderItemRepository orderItemRepository,
            CredentialRepository credentialRepository,
            PaymentRepository paymentRepository,
            OrderDeliveryService orderDeliveryService,
            CurrentUserProvider currentUserProvider,
            AdminOrderActionLogRepository adminOrderActionLogRepository
    ) {
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.credentialRepository = credentialRepository;
        this.paymentRepository = paymentRepository;
        this.orderDeliveryService = orderDeliveryService;
        this.currentUserProvider = currentUserProvider;
        this.adminOrderActionLogRepository = adminOrderActionLogRepository;
    }

    @Transactional(readOnly = true)
    public List<AdminOrderSummaryResponse> listOrders() {
        return orderRepository.findAllByOrderByCreatedAtDesc(PageRequest.of(0, 100)).stream()
                .map(order -> {
                    List<OrderItemEntity> items = orderItemRepository.findAllByOrderIdOrderByCreatedAtAsc(order.getId());
                    return new AdminOrderSummaryResponse(
                            order.getId(),
                            order.getExternalReference(),
                            order.getStatus().name(),
                            order.getPaymentMethod().name(),
                            order.getTotalCents(),
                            order.getCurrency(),
                            order.getCreatedAt(),
                            order.getPaidAt(),
                            order.getDeliveredAt(),
                            order.getCanceledAt(),
                            order.getFailureReason(),
                            new AdminOrderSummaryResponse.CustomerSummaryResponse(
                                    order.getUser().getId(),
                                    order.getUser().getName(),
                                    order.getUser().getEmail()
                            ),
                            items.stream()
                                    .map(item -> new AdminOrderSummaryResponse.ItemSummaryResponse(
                                            item.getProduct().getId(),
                                            item.getProduct().getSku(),
                                            item.getProduct().getName(),
                                            item.getQuantity()
                                    ))
                                    .toList()
                    );
                })
                .toList();
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

        OrderStatus previousStatus = order.getStatus();
        orderDeliveryService.processOrder(order);
        registerAdminOrderAction(order, previousStatus.name(), order.getStatus().name(), "REPROCESS_DELIVERY", "Manual delivery reprocess requested");
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

        OrderStatus previousStatus = order.getStatus();
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
        registerAdminOrderAction(order, previousStatus.name(), order.getStatus().name(), "RELEASE_RESERVATION", "Manual reservation release requested");
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

    @Transactional
    public OrderStatusResponse resolvePaymentReview(UUID orderId, ResolvePaymentReviewRequest request) {
        OrderEntity order = orderRepository.findById(orderId)
                .orElseThrow(() -> new NotFoundException("ORDER_NOT_FOUND", "Order not found: " + orderId));

        if (order.getStatus() != OrderStatus.PAYMENT_REVIEW) {
            throw new ConflictException(
                    "ORDER_NOT_IN_PAYMENT_REVIEW",
                    "Order cannot be resolved as payment review from status: " + order.getStatus().name()
            );
        }

        OrderStatus previousStatus = order.getStatus();
        String action = request.action().trim().toUpperCase();
        String reason = request.reason().trim();

        if ("REFUND".equals(action)) {
            order.setStatus(OrderStatus.REFUNDED);
            order.setFailureReason(reason);
            releaseReservedCredentials(orderId);
            orderRepository.save(order);
            registerAdminOrderAction(order, previousStatus.name(), order.getStatus().name(), "PAYMENT_REVIEW_REFUND", reason);
            logger.info("event=admin_payment_review_refunded orderId={} externalReference={} reason={}",
                    order.getId(), order.getExternalReference(), reason);
            return toStatusResponse(order);
        }

        if ("DELIVER".equals(action)) {
            reserveCredentialsForReviewedOrder(orderId);
            order.setStatus(OrderStatus.PAID);
            order.setFailureReason(null);
            orderRepository.save(order);
            orderDeliveryService.processOrder(order);
            registerAdminOrderAction(order, previousStatus.name(), order.getStatus().name(), "PAYMENT_REVIEW_DELIVER", reason);
            logger.info("event=admin_payment_review_delivered orderId={} externalReference={} newStatus={} reason={}",
                    order.getId(), order.getExternalReference(), order.getStatus().name(), reason);
            return toStatusResponse(order);
        }

        throw new ConflictException("PAYMENT_REVIEW_ACTION_INVALID", "Payment review action is invalid");
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
                                    credential != null ? credential.getDeliveredAt() : null,
                                    credential != null ? credential.getInvalidatedAt() : null,
                                    credential != null ? credential.getInvalidationReason() : null
                            );
                        })
                        .toList()
        );
    }

    private void reserveCredentialsForReviewedOrder(UUID orderId) {
        List<OrderItemEntity> items = orderItemRepository.findAllByOrderIdOrderByCreatedAtAsc(orderId);
        for (OrderItemEntity item : items) {
            CredentialEntity credential = item.getCredential();
            if (credential != null && credential.getStatus() == CredentialStatus.DELIVERED) {
                continue;
            }

            if (credential != null && credential.getStatus() == CredentialStatus.AVAILABLE) {
                credential.setStatus(CredentialStatus.RESERVED);
                credential.setReservedAt(OffsetDateTime.now());
                credentialRepository.save(credential);
                continue;
            }

            List<CredentialEntity> availableCredentials = credentialRepository.findByProduct_IdAndStatusOrderByCreatedAtAsc(
                    item.getProduct().getId(),
                    CredentialStatus.AVAILABLE,
                    PageRequest.of(0, 1)
            );
            if (availableCredentials.isEmpty()) {
                throw new ConflictException("PRODUCT_OUT_OF_STOCK", "No available credential for product: " + item.getProduct().getSku());
            }

            CredentialEntity replacement = availableCredentials.getFirst();
            replacement.setStatus(CredentialStatus.RESERVED);
            replacement.setReservedAt(OffsetDateTime.now());
            credentialRepository.save(replacement);
            item.setCredential(replacement);
        }
    }

    private void releaseReservedCredentials(UUID orderId) {
        List<OrderItemEntity> items = orderItemRepository.findAllByOrderIdOrderByCreatedAtAsc(orderId);
        for (OrderItemEntity item : items) {
            CredentialEntity credential = item.getCredential();
            if (credential != null && credential.getStatus() == CredentialStatus.RESERVED) {
                credential.setStatus(CredentialStatus.AVAILABLE);
                credential.setReservedAt(null);
                credentialRepository.save(credential);
            }
        }
    }

    private void registerAdminOrderAction(
            OrderEntity order,
            String previousStatus,
            String newStatus,
            String action,
            String reason
    ) {
        AdminOrderActionLogEntity actionLog = new AdminOrderActionLogEntity();
        try {
            actionLog.setAdminUser(currentUserProvider.getCurrentUser());
        } catch (RuntimeException exception) {
            logger.warn("event=admin_order_action_log_without_authenticated_admin orderId={} action={}",
                    order.getId(), action);
            actionLog.setAdminUser(order.getUser());
        }
        actionLog.setOrder(order);
        actionLog.setAction(action);
        actionLog.setReason(reason);
        actionLog.setPreviousStatus(previousStatus);
        actionLog.setNewStatus(newStatus);
        actionLog.setCreatedByAdminAt(OffsetDateTime.now());
        adminOrderActionLogRepository.save(actionLog);
    }

    private OrderStatusResponse toStatusResponse(OrderEntity order) {
        return new OrderStatusResponse(
                order.getId(),
                order.getStatus().name(),
                order.getFailureReason(),
                order.getPaidAt(),
                order.getDeliveredAt()
        );
    }
}
