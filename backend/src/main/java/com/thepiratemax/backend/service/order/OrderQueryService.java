package com.thepiratemax.backend.service.order;

import com.thepiratemax.backend.api.order.OrderCredentialsResponse;
import com.thepiratemax.backend.api.order.OrderDetailResponse;
import com.thepiratemax.backend.api.order.OrderStatusResponse;
import com.thepiratemax.backend.api.order.OrderSummaryResponse;
import com.thepiratemax.backend.domain.audit.CredentialViewEntity;
import com.thepiratemax.backend.domain.credential.CredentialEntity;
import com.thepiratemax.backend.domain.order.OrderEntity;
import com.thepiratemax.backend.domain.order.OrderItemEntity;
import com.thepiratemax.backend.domain.order.OrderStatus;
import com.thepiratemax.backend.domain.user.UserEntity;
import com.thepiratemax.backend.repository.CredentialViewRepository;
import com.thepiratemax.backend.repository.OrderItemRepository;
import com.thepiratemax.backend.repository.OrderRepository;
import com.thepiratemax.backend.service.exception.ConflictException;
import com.thepiratemax.backend.service.exception.NotFoundException;
import java.nio.charset.StandardCharsets;
import java.time.OffsetDateTime;
import java.util.Base64;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class OrderQueryService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final CredentialViewRepository credentialViewRepository;
    private final DevUserProvider devUserProvider;

    public OrderQueryService(
            OrderRepository orderRepository,
            OrderItemRepository orderItemRepository,
            CredentialViewRepository credentialViewRepository,
            DevUserProvider devUserProvider
    ) {
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.credentialViewRepository = credentialViewRepository;
        this.devUserProvider = devUserProvider;
    }

    @Transactional(readOnly = true)
    public List<OrderSummaryResponse> listCurrentUserOrders() {
        UserEntity user = devUserProvider.getCurrentUser();
        return orderRepository.findAllByUserIdOrderByCreatedAtDesc(user.getId()).stream()
                .map(this::toSummary)
                .toList();
    }

    @Transactional(readOnly = true)
    public OrderDetailResponse getOrderDetail(UUID orderId) {
        UserEntity user = devUserProvider.getCurrentUser();
        OrderEntity order = findOwnedOrder(orderId, user);
        List<OrderItemEntity> items = orderItemRepository.findAllByOrderIdAndOrderUserIdOrderByCreatedAtAsc(orderId, user.getId());
        return toDetail(order, items);
    }

    @Transactional(readOnly = true)
    public OrderStatusResponse getOrderStatus(UUID orderId) {
        UserEntity user = devUserProvider.getCurrentUser();
        OrderEntity order = findOwnedOrder(orderId, user);
        return new OrderStatusResponse(order.getId(), order.getStatus().name(), order.getPaidAt(), order.getDeliveredAt());
    }

    @Transactional
    public OrderCredentialsResponse getOrderCredentials(UUID orderId) {
        UserEntity user = devUserProvider.getCurrentUser();
        OrderEntity order = findOwnedOrder(orderId, user);
        if (order.getStatus() != OrderStatus.DELIVERED) {
            throw new ConflictException("CREDENTIALS_NOT_READY", "Credentials are not ready yet");
        }

        List<OrderItemEntity> items = orderItemRepository.findAllByOrderIdAndOrderUserIdOrderByCreatedAtAsc(orderId, user.getId());
        List<OrderCredentialsResponse.CredentialResponse> credentials = items.stream()
                .map(item -> {
                    registerCredentialView(user, order, item);
                    CredentialEntity credential = item.getCredential();
                    return new OrderCredentialsResponse.CredentialResponse(
                            item.getId(),
                            item.getProduct().getId(),
                            item.getProduct().getName(),
                            decode(credential.getLoginEncrypted()),
                            decode(credential.getPasswordEncrypted())
                    );
                })
                .toList();

        return new OrderCredentialsResponse(order.getId(), order.getStatus().name(), credentials);
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

    private OrderSummaryResponse toSummary(OrderEntity order) {
        return new OrderSummaryResponse(
                order.getId(),
                order.getStatus().name(),
                order.getPaymentMethod().name(),
                order.getTotalCents(),
                order.getCurrency(),
                order.getCreatedAt().atOffset(OffsetDateTime.now().getOffset()),
                order.getPaidAt(),
                order.getDeliveredAt()
        );
    }

    private OrderDetailResponse toDetail(OrderEntity order, List<OrderItemEntity> items) {
        return new OrderDetailResponse(
                order.getId(),
                order.getStatus().name(),
                order.getPaymentMethod().name(),
                order.getTotalCents(),
                order.getCurrency(),
                order.getCreatedAt().atOffset(OffsetDateTime.now().getOffset()),
                order.getPaidAt(),
                order.getDeliveredAt(),
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

    private String decode(String value) {
        return new String(Base64.getDecoder().decode(value), StandardCharsets.UTF_8);
    }
}
