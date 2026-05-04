package com.thepiratemax.backend.api.admin;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.thepiratemax.backend.domain.product.DeliveryType;
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
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AdminProductControllerTest {

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

    private ProductEntity product;

    @BeforeEach
    void setUp() {
        credentialViewRepository.deleteAll();
        orderItemRepository.deleteAll();
        paymentRepository.deleteAll();
        orderRepository.deleteAll();
        credentialRepository.deleteAll();
        productRepository.deleteAll();
        product = productRepository.save(buildProduct());
    }

    @Test
    void listsProductsForAdmin() throws Exception {
        mockMvc.perform(get("/api/admin/products"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(product.getId().toString()))
                .andExpect(jsonPath("$[0].status").value("ACTIVE"))
                .andExpect(jsonPath("$[0].priceCents").value(999));
    }

    @Test
    void createsProductFromAdminEndpoint() throws Exception {
        mockMvc.perform(post("/api/admin/products")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "sku": "tpm-new-product-001",
                                  "slug": "new-product",
                                  "name": "Novo Produto",
                                  "description": "Produto criado pelo admin",
                                  "category": "ASSINATURA",
                                  "provider": "CANVA",
                                  "priceCents": 699,
                                  "status": "INACTIVE",
                                  "durationDays": 30,
                                  "fulfillmentNotes": "Cadastrar credenciais antes de ativar"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.sku").value("TPM-NEW-PRODUCT-001"))
                .andExpect(jsonPath("$.slug").value("new-product"))
                .andExpect(jsonPath("$.status").value("INACTIVE"))
                .andExpect(jsonPath("$.priceCents").value(699));
    }

    @Test
    void updatesProductOperationalFields() throws Exception {
        mockMvc.perform(put("/api/admin/products/{productId}", product.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "name": "Netflix Premium Ajustado",
                                  "description": "Descricao ajustada",
                                  "provider": "Netflix Brasil",
                                  "priceCents": 1299,
                                  "status": "INACTIVE",
                                  "durationDays": 0,
                                  "fulfillmentNotes": "Nova orientacao operacional"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Netflix Premium Ajustado"))
                .andExpect(jsonPath("$.provider").value("Netflix Brasil"))
                .andExpect(jsonPath("$.priceCents").value(1299))
                .andExpect(jsonPath("$.status").value("INACTIVE"))
                .andExpect(jsonPath("$.durationDays").value(0));
    }

    private ProductEntity buildProduct() {
        ProductEntity product = new ProductEntity();
        product.setSku("TPM-ADMIN-PRODUCT-001");
        product.setSlug("admin-product");
        product.setName("Netflix Premium");
        product.setDescription("Produto admin");
        product.setCategory(ProductCategory.STREAMING);
        product.setProvider(ProductProvider.NETFLIX);
        product.setStatus(ProductStatus.ACTIVE);
        product.setPriceCents(999L);
        product.setCurrency("BRL");
        product.setRegionCode("BR");
        product.setDurationDays(30);
        product.setDeliveryType(DeliveryType.CREDENTIAL);
        product.setRequiresStock(true);
        product.setFulfillmentNotes("Entrega por credencial");
        return product;
    }
}
