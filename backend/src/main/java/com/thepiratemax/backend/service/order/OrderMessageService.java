package com.thepiratemax.backend.service.order;

import com.thepiratemax.backend.api.order.CreateOrderMessageRequest;
import com.thepiratemax.backend.api.order.OrderMessageResponse;
import com.thepiratemax.backend.domain.order.MessageSenderRole;
import com.thepiratemax.backend.domain.order.OrderEntity;
import com.thepiratemax.backend.domain.order.OrderMessageEntity;
import com.thepiratemax.backend.repository.OrderMessageRepository;
import com.thepiratemax.backend.repository.OrderRepository;
import com.thepiratemax.backend.service.auth.CurrentUserProvider;
import com.thepiratemax.backend.service.exception.NotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class OrderMessageService {

    private static final Logger logger = LoggerFactory.getLogger(OrderMessageService.class);

    private final OrderMessageRepository orderMessageRepository;
    private final OrderRepository orderRepository;
    private final CurrentUserProvider currentUserProvider;

    public OrderMessageService(
            OrderMessageRepository orderMessageRepository,
            OrderRepository orderRepository,
            CurrentUserProvider currentUserProvider
    ) {
        this.orderMessageRepository = orderMessageRepository;
        this.orderRepository = orderRepository;
        this.currentUserProvider = currentUserProvider;
    }

    @Transactional(readOnly = true)
    public List<OrderMessageResponse> getMessagesForUser(UUID orderId) {
        UUID userId = currentUserProvider.getCurrentUser().getId();
        OrderEntity order = orderRepository.findById(orderId)
                .orElseThrow(() -> new NotFoundException("ORDER_NOT_FOUND", "Order not found"));

        if (!order.getUser().getId().equals(userId)) {
            throw new NotFoundException("ORDER_NOT_FOUND", "Order not found");
        }

        return orderMessageRepository.findAllByOrderIdOrderByCreatedAtAsc(orderId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<OrderMessageResponse> getMessagesForAdmin(UUID orderId) {
        if (!orderRepository.existsById(orderId)) {
            throw new NotFoundException("ORDER_NOT_FOUND", "Order not found");
        }

        return orderMessageRepository.findAllByOrderIdOrderByCreatedAtAsc(orderId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public OrderMessageResponse sendMessageAsUser(UUID orderId, CreateOrderMessageRequest request) {
        UUID userId = currentUserProvider.getCurrentUser().getId();
        OrderEntity order = orderRepository.findById(orderId)
                .orElseThrow(() -> new NotFoundException("ORDER_NOT_FOUND", "Order not found"));

        if (!order.getUser().getId().equals(userId)) {
            throw new NotFoundException("ORDER_NOT_FOUND", "Order not found");
        }

        return saveMessage(order, request.content(), MessageSenderRole.USER);
    }

    @Transactional
    public OrderMessageResponse sendMessageAsAdmin(UUID orderId, CreateOrderMessageRequest request) {
        OrderEntity order = orderRepository.findById(orderId)
                .orElseThrow(() -> new NotFoundException("ORDER_NOT_FOUND", "Order not found"));

        return saveMessage(order, request.content(), MessageSenderRole.ADMIN);
    }

    private OrderMessageResponse saveMessage(OrderEntity order, String content, MessageSenderRole role) {
        OrderMessageEntity message = new OrderMessageEntity();
        message.setOrder(order);
        message.setContent(content);
        message.setSenderRole(role);
        
        OrderMessageEntity saved = orderMessageRepository.save(message);
        
        logger.info("event=order_message_sent orderId={} senderRole={}", order.getId(), role);
        return toResponse(saved);
    }

    private OrderMessageResponse toResponse(OrderMessageEntity message) {
        return new OrderMessageResponse(
                message.getId(),
                message.getOrder().getId(),
                message.getSenderRole().name(),
                message.getContent(),
                message.getCreatedAt() != null ? OffsetDateTime.ofInstant(message.getCreatedAt(), ZoneOffset.UTC) : null
        );
    }
}
