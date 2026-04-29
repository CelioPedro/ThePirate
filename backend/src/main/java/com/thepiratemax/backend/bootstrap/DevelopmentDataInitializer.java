package com.thepiratemax.backend.bootstrap;

import com.thepiratemax.backend.config.DevUserProperties;
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
import com.thepiratemax.backend.repository.ProductRepository;
import com.thepiratemax.backend.repository.UserRepository;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.List;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.transaction.support.TransactionTemplate;

@Configuration
@Profile({"dev", "local", "postgres-local"})
public class DevelopmentDataInitializer {

    @Bean
    CommandLineRunner seedDevelopmentData(
            UserRepository userRepository,
            ProductRepository productRepository,
            CredentialRepository credentialRepository,
            DevUserProperties devUserProperties,
            TransactionTemplate transactionTemplate
    ) {
        return args -> transactionTemplate.executeWithoutResult(status ->
                seedCatalogAndInventory(userRepository, productRepository, credentialRepository, devUserProperties));
    }

    void seedCatalogAndInventory(
            UserRepository userRepository,
            ProductRepository productRepository,
            CredentialRepository credentialRepository,
            DevUserProperties devUserProperties
    ) {
            userRepository.findByEmail(devUserProperties.defaultUserEmail())
                    .orElseGet(() -> {
                        UserEntity user = new UserEntity();
                        user.setEmail(devUserProperties.defaultUserEmail());
                        user.setName("Dev Customer");
                        user.setStatus(UserStatus.ACTIVE);
                        return userRepository.save(user);
                    });

            List<CatalogProductSeed> seeds = List.of(
                    new CatalogProductSeed(
                            "TPM-NETFLIX-001",
                            "netflix",
                            "Netflix Premium",
                            "Acesso streaming com entrega por credencial.",
                            ProductCategory.STREAMING,
                            ProductProvider.NETFLIX,
                            999L,
                            30,
                            "Perfil streaming com duracao inicial de 30 dias para operacao local.",
                            8
                    ),
                    new CatalogProductSeed(
                            "TPM-CRUNCHYROLL-001",
                            "crunchyroll",
                            "Crunchyroll",
                            "Streaming de anime com entrega por credencial individual.",
                            ProductCategory.STREAMING,
                            ProductProvider.CRUNCHYROLL,
                            999L,
                            30,
                            "Acesso streaming com vigencia operacional inicial de 30 dias.",
                            7
                    ),
                    new CatalogProductSeed(
                            "TPM-AMAZON-PRIME-001",
                            "amazon-prime",
                            "Amazon Prime Video",
                            "Streaming com foco em filmes e series, entregue por credencial.",
                            ProductCategory.STREAMING,
                            ProductProvider.AMAZON_PRIME,
                            999L,
                            30,
                            "Entrega por credencial com operacao padrao de 30 dias.",
                            7
                    ),
                    new CatalogProductSeed(
                            "TPM-HULU-001",
                            "hulu",
                            "Hulu",
                            "Streaming com entrega por credencial e uso operacional controlado.",
                            ProductCategory.STREAMING,
                            ProductProvider.HULU,
                            999L,
                            30,
                            "Entrega por credencial com operacao inicial de 30 dias.",
                            5
                    ),
                    new CatalogProductSeed(
                            "TPM-NBA-001",
                            "nba-league-pass",
                            "NBA League Pass",
                            "Acesso streaming esportivo com entrega por credencial.",
                            ProductCategory.STREAMING,
                            ProductProvider.NBA,
                            999L,
                            30,
                            "Entrega por credencial com vigencia inicial de 30 dias.",
                            4
                    ),
                    new CatalogProductSeed(
                            "TPM-PARAMOUNT-001",
                            "paramount-plus",
                            "Paramount+",
                            "Catalogo streaming focado em series e filmes.",
                            ProductCategory.STREAMING,
                            ProductProvider.PARAMOUNT_PLUS,
                            999L,
                            30,
                            "Entrega por credencial com uso regional BR.",
                            6
                    ),
                    new CatalogProductSeed(
                            "TPM-DISNEY-001",
                            "disney-plus",
                            "Disney+",
                            "Streaming familiar com franquias e catalogo infantil.",
                            ProductCategory.STREAMING,
                            ProductProvider.DISNEY_PLUS,
                            999L,
                            30,
                            "Entrega individual por credencial com vigencia operacional de 30 dias.",
                            7
                    ),
                    new CatalogProductSeed(
                            "TPM-YOUTUBE-001",
                            "youtube-premium",
                            "YouTube Premium",
                            "Assinatura de video premium com entrega por credencial.",
                            ProductCategory.STREAMING,
                            ProductProvider.YOUTUBE_PREMIUM,
                            1299L,
                            30,
                            "Entrega por credencial com operacao inicial de 30 dias.",
                            6
                    ),
                    new CatalogProductSeed(
                            "TPM-CANVA-001",
                            "canva-pro",
                            "Canva Pro",
                            "Ferramenta criativa com acesso por credencial para uso recorrente.",
                            ProductCategory.ASSINATURA,
                            ProductProvider.CANVA,
                            699L,
                            30,
                            "Licenca operacional via credencial compartilhada controlada.",
                            10
                    ),
                    new CatalogProductSeed(
                            "TPM-FIGMA-001",
                            "figma",
                            "Figma",
                            "Ferramenta de design colaborativo entregue por credencial.",
                            ProductCategory.ASSINATURA,
                            ProductProvider.FIGMA,
                            2299L,
                            30,
                            "Acesso por credencial com vigencia inicial de 30 dias.",
                            6
                    ),
                    new CatalogProductSeed(
                            "TPM-CHATGPT-001",
                            "chatgpt-plus",
                            "ChatGPT Plus",
                            "Acesso premium de IA com entrega por credencial.",
                            ProductCategory.ASSINATURA,
                            ProductProvider.CHATGPT_PLUS,
                            2599L,
                            30,
                            "Entrega por credencial com orientacao de uso individual.",
                            5
                    ),
                    new CatalogProductSeed(
                            "TPM-ANTIGRAVITY-001",
                            "antigravity",
                            "Antigravity",
                            "Produto digital premium entregue por credencial.",
                            ProductCategory.ASSINATURA,
                            ProductProvider.ANTIGRAVITY,
                            2599L,
                            30,
                            "Entrega por credencial com operacao inicial de 30 dias.",
                            4
                    ),
                    new CatalogProductSeed(
                            "TPM-LOL-D1-001",
                            "lol-diamante-1",
                            "Conta LoL Diamante 1",
                            "Conta de League of Legends pronta para uso em tier Diamante 1.",
                            ProductCategory.GAMES,
                            ProductProvider.LEAGUE_OF_LEGENDS,
                            24990L,
                            0,
                            "Entrega de conta individual com troca imediata de acesso recomendada.",
                            3
                    ),
                    new CatalogProductSeed(
                            "TPM-LOL-P2-001",
                            "lol-platina-2",
                            "Conta LoL Platina 2",
                            "Conta de League of Legends pronta para uso em tier Platina 2.",
                            ProductCategory.GAMES,
                            ProductProvider.LEAGUE_OF_LEGENDS,
                            15890L,
                            0,
                            "Entrega de conta individual com troca imediata de acesso recomendada.",
                            4
                    ),
                    new CatalogProductSeed(
                            "TPM-LOL-CHALL-001",
                            "lol-desafiante",
                            "Conta LoL Desafiante",
                            "Conta de League of Legends pronta para uso em tier Desafiante.",
                            ProductCategory.GAMES,
                            ProductProvider.LEAGUE_OF_LEGENDS,
                            38999L,
                            0,
                            "Entrega de conta individual com prioridade operacional.",
                            2
                    )
            );

            List<ProductEntity> products = seeds.stream()
                    .map(seed -> upsertProduct(productRepository, seed))
                    .toList();

            credentialRepository.deleteAllByProductIds(products.stream().map(ProductEntity::getId).toList());
            seeds.forEach(seed -> {
                ProductEntity product = products.stream()
                        .filter(item -> item.getSku().equals(seed.sku()))
                        .findFirst()
                        .orElseThrow();
                seedCredentialsForProduct(credentialRepository, product, seed);
            });
    }

    private ProductEntity upsertProduct(ProductRepository productRepository, CatalogProductSeed seed) {
        ProductEntity product = productRepository.findBySku(seed.sku()).orElseGet(ProductEntity::new);
        product.setSku(seed.sku());
        product.setSlug(seed.slug());
        product.setName(seed.name());
        product.setDescription(seed.description());
        product.setCategory(seed.category());
        product.setProvider(seed.provider());
        product.setStatus(ProductStatus.ACTIVE);
        product.setPriceCents(seed.priceCents());
        product.setCurrency("BRL");
        product.setRegionCode("BR");
        product.setDurationDays(seed.durationDays());
        product.setDeliveryType(DeliveryType.CREDENTIAL);
        product.setRequiresStock(true);
        product.setFulfillmentNotes(seed.fulfillmentNotes());
        return productRepository.save(product);
    }

    private void seedCredentialsForProduct(
            CredentialRepository credentialRepository,
            ProductEntity product,
            CatalogProductSeed seed
    ) {
        for (int index = 1; index <= seed.stockCount(); index++) {
            CredentialEntity credential = new CredentialEntity();
            credential.setProduct(product);
            credential.setLoginEncrypted(encode("login+" + seed.slug() + index + "@thepiratemax.local"));
            credential.setPasswordEncrypted(encode(seed.slug() + "-pass-" + index));
            credential.setEncryptionKeyVersion("dev-v1");
            credential.setStatus(CredentialStatus.AVAILABLE);
            credential.setSourceBatch(seed.slug() + "-batch-001");
            credentialRepository.save(credential);
        }
    }

    private String encode(String value) {
        return Base64.getEncoder().encodeToString(value.getBytes(StandardCharsets.UTF_8));
    }
}
