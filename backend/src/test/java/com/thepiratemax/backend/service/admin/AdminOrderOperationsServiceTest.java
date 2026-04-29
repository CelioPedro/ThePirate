package com.thepiratemax.backend.service.admin;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;

import com.thepiratemax.backend.api.order.OrderStatusResponse;
import com.thepiratemax.backend.domain.credential.CredentialEntity;
import com.thepiratemax.backend.domain.credential.CredentialStatus;
import com.thepiratemax.backend.domain.order.OrderEntity;
import com.thepiratemax.backend.domain.order.OrderItemEntity;
import com.thepiratemax.backend.domain.order.OrderStatus;
import com.thepiratemax.backend.domain.order.PaymentMethod;
import com.thepiratemax.backend.domain.product.DeliveryType;
import com.thepiratemax.backend.domain.product.ProductCategory;
import com.thepiratemax.backend.domain.product.ProductEntity;
import com.thepiratemax.backend.domain.product.ProductProvider;
import com.thepiratemax.backend.domain.product.ProductStatus;
import com.thepiratemax.backend.domain.user.UserEntity;
import com.thepiratemax.backend.domain.user.UserStatus;
import com.thepiratemax.backend.repository.CredentialRepository;
import com.thepiratemax.backend.repository.CredentialViewRepository;
import com.thepiratemax.backend.repository.OrderItemRepository;
import com.thepiratemax.backend.repository.OrderRepository;
import com.thepiratemax.backend.repository.PaymentRepository;
import com.thepiratemax.backend.repository.ProductRepository;
import com.thepiratemax.backend.repository.UserRepository;
import com.thepiratemax.backend.service.exception.ConflictException;
import java.time.OffsetDateTime;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test")
class AdminOrderOperationsServiceTest {

    @Autowired
    private AdminOrderOperationsService adminOrderOperationsService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CredentialRepository credentialRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private CredentialViewRepository credentialViewRepository;

    private ProductEntity product;
    private UserEntity user;

    @BeforeEach
    void setUp() {
        credentialViewRepository.deleteAll();
        orderItemRepository.deleteAll();
        paymentRepository.deleteAll();
        orderRepository.deleteAll();
        credentialRepository.deleteAll();
        productRepository.deleteAll();
        userRepository.deleteAll();

        user = new UserEntity();
        user.setEmail("admin-ops@thepiratemax.local");
        user.setName("Admin Ops");
        user.setStatus(UserStatus.ACTIVE);
        user = userRepository.save(user);

        product = new ProductEntity();
        product.setSku("TPM-ADMIN-001");
        product.setSlug("admin-product");
        product.setName("Admin Product");
        product.setDescription("Product for admin delivery reprocessing");
        product.setCategory(ProductCategory.STREAMING);
        product.setProvider(ProductProvider.NETFLIX);
        product.setStatus(ProductStatus.ACTIVE);
        product.setPriceCents(1590L);
        product.setCurrency("BRL");
        product.setRegionCode("BR");
        product.setDurationDays(30);
        product.setDeliveryType(DeliveryType.CREDENTIAL);
        product.setRequiresStock(true);
        product.setFulfillmentNotes("Admin operation test");
        product = productRepository.save(product);
    }

    @Test
    void reprocessesDeliveryFailedOrderAndDeliversReservedCredential() {
        CredentialEntity credential = createReservedCredential();
        OrderEntity order = createOrder(OrderStatus.DELIVERY_FAILED);
        order.setFailureReason("INVALID_CREDENTIAL");
        orderRepository.save(order);
        createOrderItem(order, credential);

        OrderStatusResponse response = adminOrderOperationsService.reprocessDelivery(order.getId());

        OrderEntity refreshedOrder = orderRepository.findById(order.getId()).orElseThrow();
        CredentialEntity refreshedCredential = credentialRepository.findById(credential.getId()).orElseThrow();

        assertEquals("DELIVERED", response.status());
        assertNull(response.failureReason());
        assertEquals(OrderStatus.DELIVERED, refreshedOrder.getStatus());
        assertNotNull(refreshedOrder.getDeliveredAt());
        assertEquals(CredentialStatus.DELIVERED, refreshedCredential.getStatus());
        assertNotNull(refreshedCredential.getDeliveredAt());
    }

    @Test
    void rejectsReprocessingDeliveredOrder() {
        CredentialEntity credential = createReservedCredential();
        OrderEntity order = createOrder(OrderStatus.DELIVERED);
        order.setDeliveredAt(OffsetDateTime.now().minusMinutes(1));
        orderRepository.save(order);
        createOrderItem(order, credential);

        ConflictException exception = assertThrows(
                ConflictException.class,
                () -> adminOrderOperationsService.reprocessDelivery(order.getId())
        );

        assertEquals("ORDER_NOT_REPROCESSABLE", exception.code());
    }

    @Test
    void releasesReservedCredentialsForPendingOrder() {
        CredentialEntity credential = createReservedCredential();
        OrderEntity order = createOrder(OrderStatus.PENDING);
        createOrderItem(order, credential);

        OrderStatusResponse response = adminOrderOperationsService.releaseReservation(order.getId());

        CredentialEntity refreshedCredential = credentialRepository.findById(credential.getId()).orElseThrow();

        assertEquals("PENDING", response.status());
        assertEquals(CredentialStatus.AVAILABLE, refreshedCredential.getStatus());
        assertNull(refreshedCredential.getReservedAt());
    }

    @Test
    void rejectsReservationReleaseForPaidOrder() {
        CredentialEntity credential = createReservedCredential();
        OrderEntity order = createOrder(OrderStatus.PAID);
        createOrderItem(order, credential);

        ConflictException exception = assertThrows(
                ConflictException.class,
                () -> adminOrderOperationsService.releaseReservation(order.getId())
        );

        assertEquals("ORDER_RESERVATION_NOT_RELEASABLE", exception.code());
    }

    private CredentialEntity createReservedCredential() {
        CredentialEntity credential = new CredentialEntity();
        credential.setProduct(product);
        credential.setLoginEncrypted("admin-login");
        credential.setPasswordEncrypted("admin-pass");
        credential.setEncryptionKeyVersion("test-v1");
        credential.setStatus(CredentialStatus.RESERVED);
        credential.setSourceBatch("admin-batch");
        credential.setReservedAt(OffsetDateTime.now().minusMinutes(5));
        return credentialRepository.save(credential);
    }

    private OrderEntity createOrder(OrderStatus status) {
        OrderEntity order = new OrderEntity();
        order.setUser(user);
        order.setStatus(status);
        order.setPaymentMethod(PaymentMethod.PIX);
        order.setSubtotalCents(1590L);
        order.setTotalCents(1590L);
        order.setCurrency("BRL");
        order.setExternalReference("TPM-ADMIN-REF-" + status.name());
        order.setPaidAt(OffsetDateTime.now().minusMinutes(2));
        return orderRepository.save(order);
    }

    private void createOrderItem(OrderEntity order, CredentialEntity credential) {
        OrderItemEntity item = new OrderItemEntity();
        item.setOrder(order);
        item.setProduct(product);
        item.setCredential(credential);
        item.setQuantity(1);
        item.setUnitPriceCents(1590L);
        item.setTotalPriceCents(1590L);
        orderItemRepository.save(item);
    }
}
