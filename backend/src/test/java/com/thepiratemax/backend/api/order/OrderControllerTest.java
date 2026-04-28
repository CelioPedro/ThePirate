package com.thepiratemax.backend.api.order;

import static org.hamcrest.Matchers.notNullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.thepiratemax.backend.domain.credential.CredentialEntity;
import com.thepiratemax.backend.domain.credential.CredentialStatus;
import com.thepiratemax.backend.domain.product.DeliveryType;
import com.thepiratemax.backend.domain.product.ProductCategory;
import com.thepiratemax.backend.domain.product.ProductEntity;
import com.thepiratemax.backend.domain.product.ProductProvider;
import com.thepiratemax.backend.domain.product.ProductStatus;
import com.thepiratemax.backend.domain.user.UserEntity;
import com.thepiratemax.backend.domain.user.UserStatus;
import com.thepiratemax.backend.repository.CredentialRepository;
import com.thepiratemax.backend.repository.OrderItemRepository;
import com.thepiratemax.backend.repository.OrderRepository;
import com.thepiratemax.backend.repository.PaymentRepository;
import com.thepiratemax.backend.repository.ProductRepository;
import com.thepiratemax.backend.repository.UserRepository;
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
class OrderControllerTest {

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

    private ProductEntity product;

    @BeforeEach
    void setUp() {
        orderItemRepository.deleteAll();
        paymentRepository.deleteAll();
        orderRepository.deleteAll();
        credentialRepository.deleteAll();
        productRepository.deleteAll();
        userRepository.deleteAll();

        UserEntity user = new UserEntity();
        user.setEmail("dev@thepiratemax.local");
        user.setName("Test User");
        user.setStatus(UserStatus.ACTIVE);
        userRepository.save(user);

        product = new ProductEntity();
        product.setSku("TPM-TEST-001");
        product.setSlug("test-product");
        product.setName("Test Product");
        product.setDescription("Product for order creation test");
        product.setCategory(ProductCategory.STREAMING);
        product.setProvider(ProductProvider.NETFLIX);
        product.setStatus(ProductStatus.ACTIVE);
        product.setPriceCents(2990L);
        product.setCurrency("BRL");
        product.setRegionCode("BR");
        product.setDurationDays(30);
        product.setDeliveryType(DeliveryType.CREDENTIAL);
        product.setRequiresStock(true);
        product.setFulfillmentNotes("Streaming test product");
        productRepository.save(product);

        CredentialEntity credential = new CredentialEntity();
        credential.setProduct(product);
        credential.setLoginEncrypted("login-1");
        credential.setPasswordEncrypted("pass-1");
        credential.setEncryptionKeyVersion("test-v1");
        credential.setStatus(CredentialStatus.AVAILABLE);
        credential.setSourceBatch("test-batch");
        credentialRepository.save(credential);
    }

    @Test
    void createsOrderAndReturnsPixPayload() throws Exception {
        String payload = """
                {
                  "items": [
                    {
                      "productId": "%s",
                      "quantity": 1
                    }
                  ],
                  "paymentMethod": "PIX"
                }
                """.formatted(product.getId());

        mockMvc.perform(post("/api/orders")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.order.id", notNullValue()))
                .andExpect(jsonPath("$.order.status").value("PENDING"))
                .andExpect(jsonPath("$.order.totalCents").value(2990))
                .andExpect(jsonPath("$.payment.provider").value("MERCADO_PAGO"))
                .andExpect(jsonPath("$.payment.method").value("PIX"))
                .andExpect(jsonPath("$.payment.qrCode", notNullValue()))
                .andExpect(jsonPath("$.payment.copyPaste", notNullValue()));
    }

    @Test
    void returnsConflictWhenProductIsOutOfStock() throws Exception {
        credentialRepository.deleteAll();

        String payload = """
                {
                  "items": [
                    {
                      "productId": "%s",
                      "quantity": 1
                    }
                  ],
                  "paymentMethod": "PIX"
                }
                """.formatted(product.getId());

        mockMvc.perform(post("/api/orders")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.error.code").value("OUT_OF_STOCK"));
    }

    @Test
    void returnsNotFoundWhenProductDoesNotExist() throws Exception {
        String payload = """
                {
                  "items": [
                    {
                      "productId": "cb235a33-2c67-45e4-9571-e8b2c70416c5",
                      "quantity": 1
                    }
                  ],
                  "paymentMethod": "PIX"
                }
                """;

        mockMvc.perform(post("/api/orders")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error.code").value("PRODUCT_NOT_FOUND"));
    }

    @Test
    void rejectsUnsupportedQuantity() throws Exception {
        String payload = """
                {
                  "items": [
                    {
                      "productId": "%s",
                      "quantity": 2
                    }
                  ],
                  "paymentMethod": "PIX"
                }
                """.formatted(product.getId());

        mockMvc.perform(post("/api/orders")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error.code").value("INVALID_REQUEST"));
    }
}
