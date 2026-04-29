package com.thepiratemax.backend.service.order;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

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
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test")
class OrderExpirationServiceTest {

    @Autowired
    private OrderExpirationService orderExpirationService;

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

    private OrderEntity order;
    private CredentialEntity credential;
    private PaymentEntity payment;

    @BeforeEach
    void setUp() {
        credentialViewRepository.deleteAll();
        orderItemRepository.deleteAll();
        paymentRepository.deleteAll();
        orderRepository.deleteAll();
        credentialRepository.deleteAll();
        productRepository.deleteAll();
        userRepository.deleteAll();

        UserEntity user = new UserEntity();
        user.setEmail("dev@thepiratemax.local");
        user.setName("Expiration User");
        user.setStatus(UserStatus.ACTIVE);
        user = userRepository.save(user);

        ProductEntity product = new ProductEntity();
        product.setSku("TPM-EXP-001");
        product.setSlug("expiration-product");
        product.setName("Expiration Product");
        product.setDescription("Expiration test product");
        product.setCategory(ProductCategory.STREAMING);
        product.setProvider(ProductProvider.NETFLIX);
        product.setStatus(ProductStatus.ACTIVE);
        product.setPriceCents(1090L);
        product.setCurrency("BRL");
        product.setRegionCode("BR");
        product.setDurationDays(30);
        product.setDeliveryType(DeliveryType.CREDENTIAL);
        product.setRequiresStock(true);
        product.setFulfillmentNotes("Expiration test");
        product = productRepository.save(product);

        credential = new CredentialEntity();
        credential.setProduct(product);
        credential.setLoginEncrypted("exp-login");
        credential.setPasswordEncrypted("exp-pass");
        credential.setEncryptionKeyVersion("test-v1");
        credential.setStatus(CredentialStatus.RESERVED);
        credential.setSourceBatch("exp-batch");
        credential.setReservedAt(OffsetDateTime.now().minusMinutes(30));
        credential = credentialRepository.save(credential);

        order = new OrderEntity();
        order.setUser(user);
        order.setStatus(OrderStatus.PENDING);
        order.setPaymentMethod(PaymentMethod.PIX);
        order.setSubtotalCents(1090L);
        order.setTotalCents(1090L);
        order.setCurrency("BRL");
        order.setExternalReference("TPM-EXP-REF-001");
        order = orderRepository.save(order);

        OrderItemEntity orderItem = new OrderItemEntity();
        orderItem.setOrder(order);
        orderItem.setProduct(product);
        orderItem.setCredential(credential);
        orderItem.setQuantity(1);
        orderItem.setUnitPriceCents(1090L);
        orderItem.setTotalPriceCents(1090L);
        orderItemRepository.save(orderItem);

        payment = new PaymentEntity();
        payment.setOrder(order);
        payment.setProvider(PaymentProvider.MERCADO_PAGO);
        payment.setPaymentMethod(PaymentMethod.PIX);
        payment.setAmountCents(1090L);
        payment.setCurrency("BRL");
        payment.setProviderStatus("pending");
        payment.setPixExpiresAt(OffsetDateTime.now().minusMinutes(1));
        payment = paymentRepository.save(payment);
    }

    @Test
    void expiresPendingOrderAndReleasesReservedCredential() {
        int expired = orderExpirationService.expirePendingOrdersAt(OffsetDateTime.now());

        OrderEntity refreshedOrder = orderRepository.findById(order.getId()).orElseThrow();
        CredentialEntity refreshedCredential = credentialRepository.findById(credential.getId()).orElseThrow();
        PaymentEntity refreshedPayment = paymentRepository.findById(payment.getId()).orElseThrow();

        assertEquals(1, expired);
        assertEquals(OrderStatus.CANCELED, refreshedOrder.getStatus());
        assertEquals("PIX_EXPIRED", refreshedOrder.getFailureReason());
        assertEquals(CredentialStatus.AVAILABLE, refreshedCredential.getStatus());
        assertNull(refreshedCredential.getReservedAt());
        assertEquals("expired", refreshedPayment.getProviderStatus());
    }
}
