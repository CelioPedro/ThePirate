package com.thepiratemax.backend.api.admin;

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
import com.thepiratemax.backend.repository.CredentialRepository;
import com.thepiratemax.backend.repository.ProductRepository;
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
class AdminCredentialControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CredentialRepository credentialRepository;

    private ProductEntity product;

    @BeforeEach
    void setUp() {
        credentialRepository.deleteAll();
        productRepository.deleteAll();

        product = new ProductEntity();
        product.setSku("TPM-ADMIN-CREDENTIAL-001");
        product.setSlug("admin-credential-product");
        product.setName("Admin Credential Product");
        product.setDescription("Product for credential invalidation");
        product.setCategory(ProductCategory.STREAMING);
        product.setProvider(ProductProvider.NETFLIX);
        product.setStatus(ProductStatus.ACTIVE);
        product.setPriceCents(1990L);
        product.setCurrency("BRL");
        product.setRegionCode("BR");
        product.setDurationDays(30);
        product.setDeliveryType(DeliveryType.CREDENTIAL);
        product.setRequiresStock(true);
        product.setFulfillmentNotes("Credential operation test");
        product = productRepository.save(product);
    }

    @Test
    void invalidatesAvailableCredentialFromAdminEndpoint() throws Exception {
        CredentialEntity credential = createCredential(CredentialStatus.AVAILABLE);

        mockMvc.perform(post("/api/admin/credentials/{credentialId}/invalidate", credential.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "reason": "Conta reportada como invalida pelo fornecedor"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.credentialId").value(credential.getId().toString()))
                .andExpect(jsonPath("$.status").value("INVALID"))
                .andExpect(jsonPath("$.invalidatedAt", notNullValue()))
                .andExpect(jsonPath("$.invalidationReason").value("Conta reportada como invalida pelo fornecedor"));
    }

    @Test
    void rejectsDeliveredCredentialInvalidation() throws Exception {
        CredentialEntity credential = createCredential(CredentialStatus.DELIVERED);

        mockMvc.perform(post("/api/admin/credentials/{credentialId}/invalidate", credential.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "reason": "Tentativa de invalidar depois da entrega"
                                }
                                """))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.error.code").value("CREDENTIAL_ALREADY_DELIVERED"));
    }

    private CredentialEntity createCredential(CredentialStatus status) {
        CredentialEntity credential = new CredentialEntity();
        credential.setProduct(product);
        credential.setLoginEncrypted("credential-login");
        credential.setPasswordEncrypted("credential-pass");
        credential.setEncryptionKeyVersion("test-v1");
        credential.setStatus(status);
        credential.setSourceBatch("credential-batch");
        return credentialRepository.save(credential);
    }
}
