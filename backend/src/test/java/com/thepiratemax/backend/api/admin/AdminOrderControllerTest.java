package com.thepiratemax.backend.api.admin;

import static org.hamcrest.Matchers.notNullValue;
import static org.hamcrest.Matchers.nullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.thepiratemax.backend.domain.credential.CredentialEntity;
import com.thepiratemax.backend.domain.credential.CredentialStatus;
import com.thepiratemax.backend.domain.order.OrderEntity;
import com.thepiratemax.backend.domain.order.OrderItemEntity;
import com.thepiratemax.backend.domain.order.OrderStatus;
import com.thepiratemax.backend.domain.order.PaymentMethod;
import com.thepiratemax.backend.domain.payment.PaymentEntity;
import com.thepiratemax.backend.domain.payment.PaymentProvider;
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
import java.time.OffsetDateTime;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AdminOrderControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CredentialRepository credentialRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private OrderRepository orderRepository;

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
        user.setEmail("admin-controller@thepiratemax.local");
        user.setName("Admin Controller");
        user.setStatus(UserStatus.ACTIVE);
        user = userRepository.save(user);

        product = new ProductEntity();
        product.setSku("TPM-ADMIN-CTRL-001");
        product.setSlug("admin-controller-product");
        product.setName("Admin Controller Product");
        product.setDescription("Product for admin controller test");
        product.setCategory(ProductCategory.STREAMING);
        product.setProvider(ProductProvider.NETFLIX);
        product.setStatus(ProductStatus.ACTIVE);
        product.setPriceCents(1990L);
        product.setCurrency("BRL");
        product.setRegionCode("BR");
        product.setDurationDays(30);
        product.setDeliveryType(DeliveryType.CREDENTIAL);
        product.setRequiresStock(true);
        product.setFulfillmentNotes("Admin controller operation test");
        product = productRepository.save(product);
    }

    @Test
    void reprocessesEligibleOrderFromAdminEndpoint() throws Exception {
        CredentialEntity credential = createReservedCredential();
        OrderEntity order = createOrder(OrderStatus.PAID);
        createOrderItem(order, credential);

        mockMvc.perform(post("/api/admin/orders/{orderId}/reprocess-delivery", order.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.orderId").value(order.getId().toString()))
                .andExpect(jsonPath("$.status").value("DELIVERED"))
                .andExpect(jsonPath("$.failureReason").value(nullValue()))
                .andExpect(jsonPath("$.paidAt", notNullValue()))
                .andExpect(jsonPath("$.deliveredAt", notNullValue()));
    }

    @Test
    void rejectsAdminReprocessingForDeliveredOrder() throws Exception {
        OrderEntity order = createOrder(OrderStatus.DELIVERED);
        order.setDeliveredAt(OffsetDateTime.now().minusMinutes(1));
        orderRepository.save(order);

        mockMvc.perform(post("/api/admin/orders/{orderId}/reprocess-delivery", order.getId()))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.error.code").value("ORDER_NOT_REPROCESSABLE"));
    }

    @Test
    void returnsNotFoundWhenAdminOrderDoesNotExist() throws Exception {
        mockMvc.perform(post("/api/admin/orders/{orderId}/reprocess-delivery", UUID.randomUUID()))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error.code").value("ORDER_NOT_FOUND"));
    }

    @Test
    void releasesReservationFromAdminEndpoint() throws Exception {
        CredentialEntity credential = createReservedCredential();
        OrderEntity order = createOrder(OrderStatus.PENDING);
        createOrderItem(order, credential);

        mockMvc.perform(post("/api/admin/orders/{orderId}/release-reservation", order.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.orderId").value(order.getId().toString()))
                .andExpect(jsonPath("$.status").value("PENDING"))
                .andExpect(jsonPath("$.failureReason").value(nullValue()));
    }

    @Test
    void rejectsReservationReleaseForPaidOrder() throws Exception {
        CredentialEntity credential = createReservedCredential();
        OrderEntity order = createOrder(OrderStatus.PAID);
        createOrderItem(order, credential);

        mockMvc.perform(post("/api/admin/orders/{orderId}/release-reservation", order.getId()))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.error.code").value("ORDER_RESERVATION_NOT_RELEASABLE"));
    }

    @Test
    void returnsOrderDiagnosticsFromAdminEndpoint() throws Exception {
        CredentialEntity credential = createReservedCredential();
        OrderEntity order = createOrder(OrderStatus.DELIVERY_FAILED);
        order.setFailureReason("INVALID_CREDENTIAL");
        orderRepository.save(order);
        createOrderItem(order, credential);
        createPayment(order, "approved");

        mockMvc.perform(get("/api/admin/orders/{orderId}/diagnostics", order.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.orderId").value(order.getId().toString()))
                .andExpect(jsonPath("$.externalReference").value(order.getExternalReference()))
                .andExpect(jsonPath("$.orderStatus").value("DELIVERY_FAILED"))
                .andExpect(jsonPath("$.failureReason").value("INVALID_CREDENTIAL"))
                .andExpect(jsonPath("$.payment.provider").value("MERCADO_PAGO"))
                .andExpect(jsonPath("$.items[0].productSku").value(product.getSku()))
                .andExpect(jsonPath("$.items[0].credentialStatus").value("RESERVED"));
    }

    private CredentialEntity createReservedCredential() {
        CredentialEntity credential = new CredentialEntity();
        credential.setProduct(product);
        credential.setLoginEncrypted("controller-login");
        credential.setPasswordEncrypted("controller-pass");
        credential.setEncryptionKeyVersion("test-v1");
        credential.setStatus(CredentialStatus.RESERVED);
        credential.setSourceBatch("controller-batch");
        credential.setReservedAt(OffsetDateTime.now().minusMinutes(5));
        return credentialRepository.save(credential);
    }

    private OrderEntity createOrder(OrderStatus status) {
        OrderEntity order = new OrderEntity();
        order.setUser(user);
        order.setStatus(status);
        order.setPaymentMethod(PaymentMethod.PIX);
        order.setSubtotalCents(1990L);
        order.setTotalCents(1990L);
        order.setCurrency("BRL");
        order.setExternalReference("TPM-ADMIN-CTRL-" + status.name() + "-" + UUID.randomUUID());
        order.setPaidAt(OffsetDateTime.now().minusMinutes(2));
        return orderRepository.save(order);
    }

    private void createOrderItem(OrderEntity order, CredentialEntity credential) {
        OrderItemEntity item = new OrderItemEntity();
        item.setOrder(order);
        item.setProduct(product);
        item.setCredential(credential);
        item.setQuantity(1);
        item.setUnitPriceCents(1990L);
        item.setTotalPriceCents(1990L);
        orderItemRepository.save(item);
    }

    private void createPayment(OrderEntity order, String providerStatus) {
        PaymentEntity payment = new PaymentEntity();
        payment.setOrder(order);
        payment.setProvider(PaymentProvider.MERCADO_PAGO);
        payment.setPaymentMethod(PaymentMethod.PIX);
        payment.setAmountCents(1990L);
        payment.setCurrency("BRL");
        payment.setProviderStatus(providerStatus);
        paymentRepository.save(payment);
    }
}
