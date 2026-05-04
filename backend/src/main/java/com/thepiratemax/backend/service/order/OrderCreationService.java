package com.thepiratemax.backend.service.order;

import com.thepiratemax.backend.api.order.CreateOrderRequest;
import com.thepiratemax.backend.api.order.CreateOrderResponse;
import com.thepiratemax.backend.domain.credential.CredentialEntity;
import com.thepiratemax.backend.domain.credential.CredentialStatus;
import com.thepiratemax.backend.domain.order.OrderEntity;
import com.thepiratemax.backend.domain.order.OrderItemEntity;
import com.thepiratemax.backend.domain.order.OrderStatus;
import com.thepiratemax.backend.domain.payment.PaymentEntity;
import com.thepiratemax.backend.domain.payment.PaymentProvider;
import com.thepiratemax.backend.domain.product.ProductEntity;
import com.thepiratemax.backend.domain.product.ProductStatus;
import com.thepiratemax.backend.domain.user.UserEntity;
import com.thepiratemax.backend.repository.CredentialRepository;
import com.thepiratemax.backend.repository.OrderItemRepository;
import com.thepiratemax.backend.repository.OrderRepository;
import com.thepiratemax.backend.repository.PaymentRepository;
import com.thepiratemax.backend.repository.ProductRepository;
import com.thepiratemax.backend.service.exception.ConflictException;
import com.thepiratemax.backend.service.exception.InvalidRequestException;
import com.thepiratemax.backend.service.exception.NotFoundException;
import com.thepiratemax.backend.service.auth.CurrentUserProvider;
import com.thepiratemax.backend.service.payment.PixPaymentDetails;
import com.thepiratemax.backend.service.payment.PixPaymentGateway;
import java.time.OffsetDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class OrderCreationService {

    private static final Logger logger = LoggerFactory.getLogger(OrderCreationService.class);

    private final ProductRepository productRepository;
    private final CredentialRepository credentialRepository;
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final PaymentRepository paymentRepository;
    private final CurrentUserProvider currentUserProvider;
    private final PixPaymentGateway pixPaymentGateway;

    public OrderCreationService(
            ProductRepository productRepository,
            CredentialRepository credentialRepository,
            OrderRepository orderRepository,
            OrderItemRepository orderItemRepository,
            PaymentRepository paymentRepository,
            CurrentUserProvider currentUserProvider,
            PixPaymentGateway pixPaymentGateway
    ) {
        this.productRepository = productRepository;
        this.credentialRepository = credentialRepository;
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.paymentRepository = paymentRepository;
        this.currentUserProvider = currentUserProvider;
        this.pixPaymentGateway = pixPaymentGateway;
    }

    @Transactional
    public CreateOrderResponse create(CreateOrderRequest request) {
        validateQuantities(request);
        UserEntity currentUser = currentUserProvider.getCurrentUser();
        String idempotencyKey = normalizeIdempotencyKey(request.idempotencyKey());

        if (idempotencyKey != null) {
            CreateOrderResponse existingResponse = orderRepository.findByUserIdAndIdempotencyKey(currentUser.getId(), idempotencyKey)
                    .map(this::toCreateOrderResponse)
                    .orElse(null);
            if (existingResponse != null) {
                logger.info("event=order_idempotency_hit userId={} orderId={} idempotencyKey={}",
                        currentUser.getId(), existingResponse.order().id(), idempotencyKey);
                return existingResponse;
            }
        }

        List<UUID> productIds = request.items().stream().map(CreateOrderRequest.OrderItemRequest::productId).toList();
        List<ProductEntity> products = productRepository.findAllByIdInAndStatus(productIds, ProductStatus.ACTIVE);
        Map<UUID, ProductEntity> productsById = new HashMap<>();
        products.forEach(product -> productsById.put(product.getId(), product));

        for (UUID productId : productIds) {
            if (!productsById.containsKey(productId)) {
                throw new NotFoundException("PRODUCT_NOT_FOUND", "Product not found: " + productId);
            }
        }

        OrderEntity order = new OrderEntity();
        order.setUser(currentUser);
        order.setStatus(OrderStatus.PENDING);
        order.setPaymentMethod(request.paymentMethod());
        order.setCurrency("BRL");
        order.setExternalReference("TPM-" + UUID.randomUUID());
        order.setIdempotencyKey(idempotencyKey);

        long subtotal = request.items().stream()
                .mapToLong(item -> productsById.get(item.productId()).getPriceCents() * item.quantity())
                .sum();

        order.setSubtotalCents(subtotal);
        order.setTotalCents(subtotal);
        order = orderRepository.save(order);

        for (CreateOrderRequest.OrderItemRequest itemRequest : request.items()) {
            ProductEntity product = productsById.get(itemRequest.productId());
            CredentialEntity reservedCredential = reserveCredential(product);

            OrderItemEntity orderItem = new OrderItemEntity();
            orderItem.setOrder(order);
            orderItem.setProduct(product);
            orderItem.setCredential(reservedCredential);
            orderItem.setQuantity(itemRequest.quantity());
            orderItem.setUnitPriceCents(product.getPriceCents());
            orderItem.setTotalPriceCents(product.getPriceCents() * itemRequest.quantity());
            orderItemRepository.save(orderItem);
        }

        PixPaymentDetails pixPaymentDetails = pixPaymentGateway.createPixPayment(order);

        PaymentEntity payment = new PaymentEntity();
        payment.setOrder(order);
        payment.setProvider(PaymentProvider.MERCADO_PAGO);
        payment.setPaymentMethod(request.paymentMethod());
        payment.setAmountCents(order.getTotalCents());
        payment.setCurrency(order.getCurrency());
        payment.setProviderPaymentId(pixPaymentDetails.providerPaymentId());
        payment.setPixQrCode(pixPaymentDetails.qrCode());
        payment.setPixCopyPaste(pixPaymentDetails.copyPaste());
        payment.setPixExpiresAt(pixPaymentDetails.expiresAt());
        payment.setProviderStatus(pixPaymentDetails.providerStatus());
        payment.setProviderPayload(pixPaymentDetails.providerPayload());
        paymentRepository.save(payment);
        logger.info("event=order_created orderId={} externalReference={} userId={} totalCents={} itemCount={} paymentMethod={}",
                order.getId(), order.getExternalReference(), order.getUser().getId(), order.getTotalCents(),
                request.items().size(), order.getPaymentMethod().name());

        return toCreateOrderResponse(order, payment);
    }

    private CreateOrderResponse toCreateOrderResponse(OrderEntity order) {
        PaymentEntity payment = paymentRepository.findByOrder_Id(order.getId())
                .orElseThrow(() -> new NotFoundException("PAYMENT_NOT_FOUND", "Payment not found for order: " + order.getId()));
        return toCreateOrderResponse(order, payment);
    }

    private CreateOrderResponse toCreateOrderResponse(OrderEntity order, PaymentEntity payment) {
        return new CreateOrderResponse(
                new CreateOrderResponse.OrderResponse(
                        order.getId(),
                        order.getExternalReference(),
                        order.getStatus().name(),
                        order.getPaymentMethod().name(),
                        order.getTotalCents(),
                        order.getCurrency(),
                        order.getCreatedAt()
                ),
                new CreateOrderResponse.PaymentResponse(
                        payment.getProvider().name(),
                        payment.getPaymentMethod().name(),
                        payment.getPixQrCode(),
                        payment.getPixCopyPaste(),
                        payment.getPixExpiresAt()
                )
        );
    }

    private String normalizeIdempotencyKey(String idempotencyKey) {
        if (idempotencyKey == null || idempotencyKey.isBlank()) {
            return null;
        }
        return idempotencyKey.trim();
    }

    private void validateQuantities(CreateOrderRequest request) {
        boolean hasUnsupportedQuantity = request.items().stream().anyMatch(item -> item.quantity() != 1);
        if (hasUnsupportedQuantity) {
            throw new InvalidRequestException("INVALID_REQUEST", "Only quantity = 1 is supported right now");
        }
    }

    private CredentialEntity reserveCredential(ProductEntity product) {
        List<CredentialEntity> availableCredentials = credentialRepository.findByProduct_IdAndStatusOrderByCreatedAtAsc(
                product.getId(),
                CredentialStatus.AVAILABLE,
                PageRequest.of(0, 1)
        );

        if (availableCredentials.isEmpty()) {
            throw new ConflictException("OUT_OF_STOCK", "Product is out of stock: " + product.getName());
        }

        CredentialEntity credential = availableCredentials.getFirst();
        credential.setStatus(CredentialStatus.RESERVED);
        credential.setReservedAt(OffsetDateTime.now());
        logger.info("event=credential_reserved productId={} credentialId={} reservedAt={}", product.getId(), credential.getId(), credential.getReservedAt());
        return credentialRepository.save(credential);
    }
}
