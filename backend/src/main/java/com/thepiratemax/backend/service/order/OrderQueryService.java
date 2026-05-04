package com.thepiratemax.backend.service.order;

import com.thepiratemax.backend.api.order.OrderCredentialsResponse;
import com.thepiratemax.backend.api.order.OrderCredentialSecretResponse;
import com.thepiratemax.backend.api.order.OrderDetailResponse;
import com.thepiratemax.backend.api.order.OrderStatusResponse;
import com.thepiratemax.backend.api.order.OrderSummaryResponse;
import com.thepiratemax.backend.domain.audit.CredentialViewEntity;
import com.thepiratemax.backend.domain.credential.CredentialEntity;
import com.thepiratemax.backend.domain.order.OrderEntity;
import com.thepiratemax.backend.domain.order.OrderItemEntity;
import com.thepiratemax.backend.domain.order.OrderStatus;
import com.thepiratemax.backend.domain.payment.PaymentEntity;
import com.thepiratemax.backend.domain.user.UserEntity;
import com.thepiratemax.backend.repository.CredentialViewRepository;
import com.thepiratemax.backend.repository.OrderItemRepository;
import com.thepiratemax.backend.repository.OrderRepository;
import com.thepiratemax.backend.repository.PaymentRepository;
import com.thepiratemax.backend.service.auth.CurrentUserProvider;
import com.thepiratemax.backend.service.credential.CredentialCryptoService;
import com.thepiratemax.backend.service.exception.ConflictException;
import com.thepiratemax.backend.service.exception.NotFoundException;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class OrderQueryService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final PaymentRepository paymentRepository;
    private final CredentialViewRepository credentialViewRepository;
    private final CurrentUserProvider currentUserProvider;
    private final CredentialCryptoService credentialCryptoService;

    public OrderQueryService(
            OrderRepository orderRepository,
            OrderItemRepository orderItemRepository,
            PaymentRepository paymentRepository,
            CredentialViewRepository credentialViewRepository,
            CurrentUserProvider currentUserProvider,
            CredentialCryptoService credentialCryptoService
    ) {
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.paymentRepository = paymentRepository;
        this.credentialViewRepository = credentialViewRepository;
        this.currentUserProvider = currentUserProvider;
        this.credentialCryptoService = credentialCryptoService;
    }

    @Transactional(readOnly = true)
    public List<OrderSummaryResponse> listCurrentUserOrders() {
        UserEntity user = currentUserProvider.getCurrentUser();
        return orderRepository.findAllByUserIdOrderByCreatedAtDesc(user.getId()).stream()
                .map(this::toSummary)
                .toList();
    }

    @Transactional(readOnly = true)
    public OrderDetailResponse getOrderDetail(UUID orderId) {
        UserEntity user = currentUserProvider.getCurrentUser();
        OrderEntity order = findOwnedOrder(orderId, user);
        List<OrderItemEntity> items = orderItemRepository.findAllByOrderIdAndOrderUserIdOrderByCreatedAtAsc(orderId, user.getId());
        PaymentEntity payment = paymentRepository.findByOrder_Id(orderId).orElse(null);
        return toDetail(order, items, payment);
    }

    @Transactional(readOnly = true)
    public OrderStatusResponse getOrderStatus(UUID orderId) {
        UserEntity user = currentUserProvider.getCurrentUser();
        OrderEntity order = findOwnedOrder(orderId, user);
        return new OrderStatusResponse(
                order.getId(),
                order.getStatus().name(),
                order.getFailureReason(),
                order.getPaidAt(),
                order.getDeliveredAt()
        );
    }

    @Transactional
    public OrderCredentialsResponse getOrderCredentials(UUID orderId) {
        UserEntity user = currentUserProvider.getCurrentUser();
        OrderEntity order = findOwnedOrder(orderId, user);
        if (order.getStatus() != OrderStatus.DELIVERED) {
            throw new ConflictException("CREDENTIALS_NOT_READY", "Credentials are not ready yet");
        }

        List<OrderItemEntity> items = orderItemRepository.findAllByOrderIdAndOrderUserIdOrderByCreatedAtAsc(orderId, user.getId());
        List<OrderCredentialsResponse.CredentialResponse> credentials = items.stream()
                .map(item -> {
                    CredentialEntity credential = item.getCredential();
                    return new OrderCredentialsResponse.CredentialResponse(
                            item.getId(),
                            item.getProduct().getId(),
                            item.getProduct().getName(),
                            credential != null
                                    ? loginHint(credentialCryptoService.decrypt(credential.getLoginEncrypted(), credential.getEncryptionKeyVersion()))
                                    : "",
                            credential != null
                    );
                })
                .toList();

        return new OrderCredentialsResponse(order.getId(), order.getStatus().name(), credentials);
    }

    @Transactional
    public OrderCredentialSecretResponse revealOrderCredential(UUID orderId, UUID orderItemId) {
        UserEntity user = currentUserProvider.getCurrentUser();
        OrderEntity order = findOwnedOrder(orderId, user);
        if (order.getStatus() != OrderStatus.DELIVERED) {
            throw new ConflictException("CREDENTIALS_NOT_READY", "Credentials are not ready yet");
        }

        OrderItemEntity item = orderItemRepository.findByIdAndOrderIdAndOrderUserId(orderItemId, orderId, user.getId())
                .orElseThrow(() -> new NotFoundException("ORDER_ITEM_NOT_FOUND", "Order item not found: " + orderItemId));
        CredentialEntity credential = item.getCredential();
        if (credential == null) {
            throw new ConflictException("CREDENTIALS_NOT_READY", "Credentials are not ready yet");
        }

        registerCredentialView(user, order, item);
        return new OrderCredentialSecretResponse(
                order.getId(),
                item.getId(),
                item.getProduct().getId(),
                item.getProduct().getName(),
                credentialCryptoService.decrypt(credential.getLoginEncrypted(), credential.getEncryptionKeyVersion()),
                credentialCryptoService.decrypt(credential.getPasswordEncrypted(), credential.getEncryptionKeyVersion())
        );
    }

    private void registerCredentialView(UserEntity user, OrderEntity order, OrderItemEntity item) {
        CredentialViewEntity view = new CredentialViewEntity();
        view.setUser(user);
        view.setOrder(order);
        view.setOrderItem(item);
        view.setViewedAt(OffsetDateTime.now());
        credentialViewRepository.save(view);
    }

    private OrderEntity findOwnedOrder(UUID orderId, UserEntity user) {
        return orderRepository.findByIdAndUserId(orderId, user.getId())
                .orElseThrow(() -> new NotFoundException("ORDER_NOT_FOUND", "Order not found: " + orderId));
    }

    private String loginHint(String login) {
        if (login == null || login.isBlank()) {
            return "";
        }
        int at = login.indexOf('@');
        if (at > 2) {
            String name = login.substring(0, at);
            String domain = login.substring(at);
            return name.substring(0, 2) + "*".repeat(Math.min(name.length() - 2, 8)) + domain;
        }
        if (login.length() <= 3) {
            return "*".repeat(login.length());
        }
        return login.substring(0, 2) + "*".repeat(Math.min(login.length() - 2, 8));
    }

    private OrderSummaryResponse toSummary(OrderEntity order) {
        return new OrderSummaryResponse(
                order.getId(),
                order.getStatus().name(),
                order.getPaymentMethod().name(),
                order.getTotalCents(),
                order.getCurrency(),
                order.getCreatedAt().atOffset(OffsetDateTime.now().getOffset()),
                order.getPaidAt(),
                order.getDeliveredAt(),
                order.getCanceledAt()
        );
    }

    private OrderDetailResponse toDetail(OrderEntity order, List<OrderItemEntity> items, PaymentEntity payment) {
        return new OrderDetailResponse(
                order.getId(),
                order.getExternalReference(),
                order.getStatus().name(),
                order.getFailureReason(),
                order.getPaymentMethod().name(),
                order.getTotalCents(),
                order.getCurrency(),
                order.getCreatedAt().atOffset(OffsetDateTime.now().getOffset()),
                order.getPaidAt(),
                order.getDeliveredAt(),
                order.getCanceledAt(),
                payment != null ? new OrderDetailResponse.PaymentDetailResponse(
                        payment.getProvider().name(),
                        payment.getProviderStatus(),
                        payment.getProviderPaymentId(),
                        payment.getPixQrCode(),
                        payment.getPixCopyPaste(),
                        payment.getPixExpiresAt()
                ) : null,
                items.stream()
                        .map(item -> new OrderDetailResponse.OrderItemDetailResponse(
                                item.getId(),
                                item.getProduct().getId(),
                                item.getProduct().getName(),
                                item.getQuantity(),
                                item.getUnitPriceCents(),
                                item.getTotalPriceCents()
                        ))
                        .toList()
        );
    }

}
