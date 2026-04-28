package com.thepiratemax.backend.service.delivery;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

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
import java.time.OffsetDateTime;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test")
class OrderDeliveryServiceTest {

    @Autowired
    private OrderDeliveryService orderDeliveryService;

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

    private OrderEntity paidOrder;
    private CredentialEntity reservedCredential;

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
        user.setName("Delivery User");
        user.setStatus(UserStatus.ACTIVE);
        user = userRepository.save(user);

        ProductEntity product = new ProductEntity();
        product.setSku("TPM-DELIVERY-001");
        product.setSlug("delivery-product");
        product.setName("Delivery Product");
        product.setDescription("Delivery test product");
        product.setCategory(ProductCategory.STREAMING);
        product.setProvider(ProductProvider.NETFLIX);
        product.setStatus(ProductStatus.ACTIVE);
        product.setPriceCents(1190L);
        product.setCurrency("BRL");
        product.setRegionCode("BR");
        product.setDurationDays(30);
        product.setDeliveryType(DeliveryType.CREDENTIAL);
        product.setRequiresStock(true);
        product.setFulfillmentNotes("Delivery test");
        product = productRepository.save(product);

        reservedCredential = new CredentialEntity();
        reservedCredential.setProduct(product);
        reservedCredential.setLoginEncrypted("delivery-login");
        reservedCredential.setPasswordEncrypted("delivery-pass");
        reservedCredential.setEncryptionKeyVersion("test-v1");
        reservedCredential.setStatus(CredentialStatus.RESERVED);
        reservedCredential.setSourceBatch("delivery-batch");
        reservedCredential.setReservedAt(OffsetDateTime.now().minusMinutes(2));
        reservedCredential = credentialRepository.save(reservedCredential);

        paidOrder = new OrderEntity();
        paidOrder.setUser(user);
        paidOrder.setStatus(OrderStatus.PAID);
        paidOrder.setPaymentMethod(PaymentMethod.PIX);
        paidOrder.setSubtotalCents(1190L);
        paidOrder.setTotalCents(1190L);
        paidOrder.setCurrency("BRL");
        paidOrder.setExternalReference("TPM-DELIVERY-REF-001");
        paidOrder.setPaidAt(OffsetDateTime.now().minusMinutes(1));
        paidOrder = orderRepository.save(paidOrder);

        OrderItemEntity item = new OrderItemEntity();
        item.setOrder(paidOrder);
        item.setProduct(product);
        item.setCredential(reservedCredential);
        item.setQuantity(1);
        item.setUnitPriceCents(1190L);
        item.setTotalPriceCents(1190L);
        orderItemRepository.save(item);
    }

    @Test
    void processesPaidOrderAndDeliversReservedCredential() {
        int processed = orderDeliveryService.processPendingDeliveriesNow();

        OrderEntity refreshedOrder = orderRepository.findById(paidOrder.getId()).orElseThrow();
        CredentialEntity refreshedCredential = credentialRepository.findById(reservedCredential.getId()).orElseThrow();

        assertEquals(1, processed);
        assertEquals(OrderStatus.DELIVERED, refreshedOrder.getStatus());
        assertNotNull(refreshedOrder.getDeliveredAt());
        assertEquals(CredentialStatus.DELIVERED, refreshedCredential.getStatus());
        assertNotNull(refreshedCredential.getDeliveredAt());
    }
}
