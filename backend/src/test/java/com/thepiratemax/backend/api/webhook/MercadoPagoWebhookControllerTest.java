package com.thepiratemax.backend.api.webhook;

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
import com.thepiratemax.backend.repository.WebhookEventRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class MercadoPagoWebhookControllerTest {

    @Autowired
    private MockMvc mockMvc;

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
    private WebhookEventRepository webhookEventRepository;

    @Autowired
    private CredentialViewRepository credentialViewRepository;

    private OrderEntity order;

    @BeforeEach
    void setUp() {
        credentialViewRepository.deleteAll();
        webhookEventRepository.deleteAll();
        orderItemRepository.deleteAll();
        paymentRepository.deleteAll();
        orderRepository.deleteAll();
        credentialRepository.deleteAll();
        productRepository.deleteAll();
        userRepository.deleteAll();

        UserEntity user = new UserEntity();
        user.setEmail("dev@thepiratemax.local");
        user.setName("Webhook User");
        user.setStatus(UserStatus.ACTIVE);
        user = userRepository.save(user);

        ProductEntity product = new ProductEntity();
        product.setSku("TPM-WEBHOOK-001");
        product.setSlug("webhook-product");
        product.setName("Webhook Product");
        product.setDescription("Webhook test product");
        product.setCategory(ProductCategory.STREAMING);
        product.setProvider(ProductProvider.NETFLIX);
        product.setStatus(ProductStatus.ACTIVE);
        product.setPriceCents(1990L);
        product.setCurrency("BRL");
        product.setRegionCode("BR");
        product.setDurationDays(30);
        product.setDeliveryType(com.thepiratemax.backend.domain.product.DeliveryType.CREDENTIAL);
        product.setRequiresStock(true);
        product.setFulfillmentNotes("Webhook test");
        product = productRepository.save(product);

        CredentialEntity credential = new CredentialEntity();
        credential.setProduct(product);
        credential.setLoginEncrypted("reserved-login");
        credential.setPasswordEncrypted("reserved-pass");
        credential.setEncryptionKeyVersion("test-v1");
        credential.setStatus(CredentialStatus.RESERVED);
        credential.setSourceBatch("test-batch");
        credentialRepository.save(credential);

        order = new OrderEntity();
        order.setUser(user);
        order.setStatus(OrderStatus.PENDING);
        order.setPaymentMethod(PaymentMethod.PIX);
        order.setSubtotalCents(1990L);
        order.setTotalCents(1990L);
        order.setCurrency("BRL");
        order.setExternalReference("TPM-WEBHOOK-REF-001");
        order = orderRepository.save(order);

        OrderItemEntity orderItem = new OrderItemEntity();
        orderItem.setOrder(order);
        orderItem.setProduct(product);
        orderItem.setCredential(credential);
        orderItem.setQuantity(1);
        orderItem.setUnitPriceCents(1990L);
        orderItem.setTotalPriceCents(1990L);
        orderItemRepository.save(orderItem);

        PaymentEntity payment = new PaymentEntity();
        payment.setOrder(order);
        payment.setProvider(PaymentProvider.MERCADO_PAGO);
        payment.setPaymentMethod(PaymentMethod.PIX);
        payment.setAmountCents(1990L);
        payment.setCurrency("BRL");
        payment.setProviderStatus("pending");
        paymentRepository.save(payment);
    }

    @Test
    void approvesPaymentAndMovesOrderToPaid() throws Exception {
        String payload = """
                {
                  "action": "payment.updated",
                  "data": {
                    "id": "mp-payment-001",
                    "status": "approved",
                    "external_reference": "TPM-WEBHOOK-REF-001"
                  }
                }
                """;

        mockMvc.perform(post("/api/webhooks/mercadopago")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.received").value(true));

        OrderEntity refreshedOrder = orderRepository.findById(order.getId()).orElseThrow();
        PaymentEntity payment = paymentRepository.findByOrder_ExternalReference(order.getExternalReference()).orElseThrow();

        CredentialEntity refreshedCredential = credentialRepository.findAll().getFirst();

        org.junit.jupiter.api.Assertions.assertEquals(OrderStatus.PAID, refreshedOrder.getStatus());
        org.junit.jupiter.api.Assertions.assertNotNull(refreshedOrder.getPaidAt());
        org.junit.jupiter.api.Assertions.assertEquals(null, refreshedOrder.getDeliveredAt());
        org.junit.jupiter.api.Assertions.assertEquals("approved", payment.getProviderStatus());
        org.junit.jupiter.api.Assertions.assertEquals("mp-payment-001", payment.getProviderPaymentId());
        org.junit.jupiter.api.Assertions.assertNotNull(payment.getPaidAt());
        org.junit.jupiter.api.Assertions.assertEquals(CredentialStatus.RESERVED, refreshedCredential.getStatus());
        org.junit.jupiter.api.Assertions.assertEquals(null, refreshedCredential.getDeliveredAt());
        org.junit.jupiter.api.Assertions.assertEquals(1, webhookEventRepository.count());
    }

    @Test
    void rejectsWebhookWithoutRequiredFields() throws Exception {
        String payload = """
                {
                  "action": "payment.updated",
                  "data": {
                    "id": "mp-payment-001"
                  }
                }
                """;

        mockMvc.perform(post("/api/webhooks/mercadopago")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error.code").value("INVALID_WEBHOOK"));
    }
}
