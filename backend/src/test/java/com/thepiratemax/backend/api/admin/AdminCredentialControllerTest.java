package com.thepiratemax.backend.api.admin;

import static org.hamcrest.Matchers.notNullValue;
import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
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
import com.thepiratemax.backend.service.credential.CredentialCryptoService;
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

    @Autowired
    private CredentialCryptoService credentialCryptoService;

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
    void createsAvailableCredentialFromAdminEndpoint() throws Exception {
        mockMvc.perform(post("/api/admin/credentials")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "productId": "%s",
                                  "login": "new-login@thepiratemax.local",
                                  "password": "new-secret",
                                  "sourceBatch": "manual-test"
                                }
                                """.formatted(product.getId())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.credentialId", notNullValue()))
                .andExpect(jsonPath("$.productId").value(product.getId().toString()))
                .andExpect(jsonPath("$.productSku").value(product.getSku()))
                .andExpect(jsonPath("$.productName").value(product.getName()))
                .andExpect(jsonPath("$.status").value("AVAILABLE"))
                .andExpect(jsonPath("$.sourceBatch").value("manual-test"));

        CredentialEntity credential = credentialRepository.findAll().getFirst();
        org.assertj.core.api.Assertions.assertThat(credentialCryptoService.decrypt(
                credential.getLoginEncrypted(),
                credential.getEncryptionKeyVersion()
        )).isEqualTo("new-login@thepiratemax.local");
        org.assertj.core.api.Assertions.assertThat(credentialCryptoService.decrypt(
                credential.getPasswordEncrypted(),
                credential.getEncryptionKeyVersion()
        )).isEqualTo("new-secret");
    }

    @Test
    void listsCredentialsForAdminOperations() throws Exception {
        CredentialEntity available = createCredential(CredentialStatus.AVAILABLE);
        createCredential(CredentialStatus.INVALID);

        mockMvc.perform(get("/api/admin/credentials")
                        .param("productId", product.getId().toString())
                        .param("status", "AVAILABLE"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].credentialId").value(available.getId().toString()))
                .andExpect(jsonPath("$[0].status").value("AVAILABLE"))
                .andExpect(jsonPath("$[0].login").value("credential-login"))
                .andExpect(jsonPath("$[0].password").value("credential-pass"))
                .andExpect(jsonPath("$[0].productSku").value(product.getSku()));
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
        credential.setLoginEncrypted(credentialCryptoService.encrypt("credential-login"));
        credential.setPasswordEncrypted(credentialCryptoService.encrypt("credential-pass"));
        credential.setEncryptionKeyVersion(credentialCryptoService.currentKeyVersion());
        credential.setStatus(status);
        credential.setSourceBatch("credential-batch");
        return credentialRepository.save(credential);
    }
}
