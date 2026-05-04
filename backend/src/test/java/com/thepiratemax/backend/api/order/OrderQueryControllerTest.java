package com.thepiratemax.backend.api.order;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.thepiratemax.backend.domain.audit.CredentialViewEntity;
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
import java.nio.charset.StandardCharsets;
import java.time.OffsetDateTime;
import java.util.Base64;
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
class OrderQueryControllerTest {

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
    private CredentialViewRepository credentialViewRepository;

    private OrderEntity deliveredOrder;
    private OrderItemEntity deliveredOrderItem;

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
        user.setName("Query User");
        user.setStatus(UserStatus.ACTIVE);
        user = userRepository.save(user);

        ProductEntity product = new ProductEntity();
        product.setSku("TPM-QUERY-001");
        product.setSlug("query-product");
        product.setName("Query Product");
        product.setDescription("Query test product");
        product.setCategory(ProductCategory.STREAMING);
        product.setProvider(ProductProvider.NETFLIX);
        product.setStatus(ProductStatus.ACTIVE);
        product.setPriceCents(1590L);
        product.setCurrency("BRL");
        product.setRegionCode("BR");
        product.setDurationDays(30);
        product.setDeliveryType(DeliveryType.CREDENTIAL);
        product.setRequiresStock(true);
        product.setFulfillmentNotes("Query test");
        product = productRepository.save(product);

        CredentialEntity credential = new CredentialEntity();
        credential.setProduct(product);
        credential.setLoginEncrypted(encode("query-login@test.local"));
        credential.setPasswordEncrypted(encode("query-pass"));
        credential.setEncryptionKeyVersion("test-v1");
        credential.setStatus(CredentialStatus.DELIVERED);
        credential.setSourceBatch("query-batch");
        credential.setReservedAt(OffsetDateTime.now().minusMinutes(5));
        credential.setDeliveredAt(OffsetDateTime.now().minusMinutes(1));
        credential = credentialRepository.save(credential);

        deliveredOrder = new OrderEntity();
        deliveredOrder.setUser(user);
        deliveredOrder.setStatus(OrderStatus.DELIVERED);
        deliveredOrder.setPaymentMethod(PaymentMethod.PIX);
        deliveredOrder.setSubtotalCents(1590L);
        deliveredOrder.setTotalCents(1590L);
        deliveredOrder.setCurrency("BRL");
        deliveredOrder.setExternalReference("TPM-QUERY-ORDER-001");
        deliveredOrder.setPaidAt(OffsetDateTime.now().minusMinutes(2));
        deliveredOrder.setDeliveredAt(OffsetDateTime.now().minusMinutes(1));
        deliveredOrder = orderRepository.save(deliveredOrder);

        deliveredOrderItem = new OrderItemEntity();
        deliveredOrderItem.setOrder(deliveredOrder);
        deliveredOrderItem.setProduct(product);
        deliveredOrderItem.setCredential(credential);
        deliveredOrderItem.setQuantity(1);
        deliveredOrderItem.setUnitPriceCents(1590L);
        deliveredOrderItem.setTotalPriceCents(1590L);
        deliveredOrderItem = orderItemRepository.save(deliveredOrderItem);
    }

    @Test
    void returnsCurrentUserOrderStatus() throws Exception {
        mockMvc.perform(get("/api/orders/" + deliveredOrder.getId() + "/status"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.orderId").value(deliveredOrder.getId().toString()))
                .andExpect(jsonPath("$.status").value("DELIVERED"));
    }

    @Test
    void returnsDeliveredCredentialMetadataWithoutSecrets() throws Exception {
        mockMvc.perform(get("/api/orders/" + deliveredOrder.getId() + "/credentials"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.orderId").value(deliveredOrder.getId().toString()))
                .andExpect(jsonPath("$.status").value("DELIVERED"))
                .andExpect(jsonPath("$.credentials[0].productName").value("Query Product"))
                .andExpect(jsonPath("$.credentials[0].loginHint").value("qu********@test.local"))
                .andExpect(jsonPath("$.credentials[0].secretAvailable").value(true))
                .andExpect(jsonPath("$.credentials[0].login").doesNotExist())
                .andExpect(jsonPath("$.credentials[0].password").doesNotExist());

        org.junit.jupiter.api.Assertions.assertEquals(0, credentialViewRepository.count());
    }

    @Test
    void revealsDeliveredCredentialSecretAndAuditsView() throws Exception {
        mockMvc.perform(post("/api/orders/" + deliveredOrder.getId() + "/credentials/" + deliveredOrderItem.getId() + "/secret"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.orderId").value(deliveredOrder.getId().toString()))
                .andExpect(jsonPath("$.orderItemId").value(deliveredOrderItem.getId().toString()))
                .andExpect(jsonPath("$.productName").value("Query Product"))
                .andExpect(jsonPath("$.login").value("query-login@test.local"))
                .andExpect(jsonPath("$.password").value("query-pass"));

        org.junit.jupiter.api.Assertions.assertEquals(1, credentialViewRepository.count());
    }

    private String encode(String value) {
        return Base64.getEncoder().encodeToString(value.getBytes(StandardCharsets.UTF_8));
    }
}
