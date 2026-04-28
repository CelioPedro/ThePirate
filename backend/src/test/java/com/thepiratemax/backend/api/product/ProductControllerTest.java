package com.thepiratemax.backend.api.product;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.thepiratemax.backend.domain.product.DeliveryType;
import com.thepiratemax.backend.domain.credential.CredentialEntity;
import com.thepiratemax.backend.domain.credential.CredentialStatus;
import com.thepiratemax.backend.domain.product.ProductCategory;
import com.thepiratemax.backend.domain.product.ProductEntity;
import com.thepiratemax.backend.domain.product.ProductProvider;
import com.thepiratemax.backend.domain.product.ProductStatus;
import com.thepiratemax.backend.repository.CredentialRepository;
import com.thepiratemax.backend.repository.CredentialViewRepository;
import com.thepiratemax.backend.repository.OrderItemRepository;
import com.thepiratemax.backend.repository.OrderRepository;
import com.thepiratemax.backend.repository.PaymentRepository;
import com.thepiratemax.backend.repository.ProductRepository;
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
class ProductControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ProductRepository productRepository;

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

    @BeforeEach
    void setUp() {
        credentialViewRepository.deleteAll();
        orderItemRepository.deleteAll();
        paymentRepository.deleteAll();
        orderRepository.deleteAll();
        credentialRepository.deleteAll();
        productRepository.deleteAll();

        ProductEntity alpha = productRepository.save(buildProduct("AAA", "Alpha"));
        ProductEntity beta = productRepository.save(buildProduct("BBB", "Beta"));
        credentialRepository.save(buildCredential(alpha, "alpha-login"));
        credentialRepository.save(buildCredential(alpha, "alpha-login-2"));
        credentialRepository.save(buildCredential(beta, "beta-login"));
    }

    @Test
    void listsActiveProducts() throws Exception {
        mockMvc.perform(get("/api/products"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("Alpha"))
                .andExpect(jsonPath("$[0].availableStock").value(2))
                .andExpect(jsonPath("$[1].name").value("Beta"))
                .andExpect(jsonPath("$[1].availableStock").value(1));
    }

    @Test
    void listsInventoryByProduct() throws Exception {
        mockMvc.perform(get("/api/products/inventory"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("Alpha"))
                .andExpect(jsonPath("$[0].availableStock").value(2));
    }

    private ProductEntity buildProduct(String sku, String name) {
        ProductEntity product = new ProductEntity();
        product.setSku(sku);
        product.setSlug(name.toLowerCase());
        product.setName(name);
        product.setDescription("Seeded product");
        product.setCategory(ProductCategory.STREAMING);
        product.setProvider("Alpha".equals(name) ? ProductProvider.NETFLIX : ProductProvider.DISNEY_PLUS);
        product.setStatus(ProductStatus.ACTIVE);
        product.setPriceCents(1990L);
        product.setCurrency("BRL");
        product.setRegionCode("BR");
        product.setDurationDays(30);
        product.setDeliveryType(DeliveryType.CREDENTIAL);
        product.setRequiresStock(true);
        product.setFulfillmentNotes("Seeded product for catalog test");
        return product;
    }

    private CredentialEntity buildCredential(ProductEntity product, String loginToken) {
        CredentialEntity credential = new CredentialEntity();
        credential.setProduct(product);
        credential.setLoginEncrypted(loginToken);
        credential.setPasswordEncrypted("pass-" + loginToken);
        credential.setEncryptionKeyVersion("test-v1");
        credential.setStatus(CredentialStatus.AVAILABLE);
        credential.setSourceBatch("test-batch");
        return credential;
    }
}
