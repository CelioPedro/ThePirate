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
import com.thepiratemax.backend.domain.user.UserRole;
import com.thepiratemax.backend.domain.user.UserStatus;
import com.thepiratemax.backend.repository.CredentialRepository;
import com.thepiratemax.backend.repository.CatalogCategoryRepository;
import com.thepiratemax.backend.repository.ProductRepository;
import com.thepiratemax.backend.repository.UserRepository;
import java.util.List;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.support.TransactionTemplate;
import com.thepiratemax.backend.service.credential.CredentialCryptoService;

@Configuration
@Profile({"dev", "local", "postgres-local"})
public class DevelopmentDataInitializer {

    @Bean
    CommandLineRunner seedDevelopmentData(
            UserRepository userRepository,
            ProductRepository productRepository,
            CatalogCategoryRepository catalogCategoryRepository,
            CredentialRepository credentialRepository,
            DevUserProperties devUserProperties,
            PasswordEncoder passwordEncoder,
            CredentialCryptoService credentialCryptoService,
            TransactionTemplate transactionTemplate
    ) {
        return args -> transactionTemplate.executeWithoutResult(status ->
                seedCatalogAndInventory(userRepository, productRepository, catalogCategoryRepository, credentialRepository, devUserProperties, passwordEncoder, credentialCryptoService));
    }

    void seedCatalogAndInventory(
            UserRepository userRepository,
            ProductRepository productRepository,
            CatalogCategoryRepository catalogCategoryRepository,
            CredentialRepository credentialRepository,
            DevUserProperties devUserProperties,
            PasswordEncoder passwordEncoder,
            CredentialCryptoService credentialCryptoService
    ) {
            upsertUser(userRepository, devUserProperties.defaultUserEmail(), "Dev Customer", UserRole.CUSTOMER, "dev123456", passwordEncoder);
            upsertUser(userRepository, "admin@thepiratemax.local", "Dev Admin", UserRole.ADMIN, "admin123456", passwordEncoder);

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
                            5,
                            "streaming",
                            "/catalog/products/hulu.png"
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
                            4,
                            "streaming",
                            "/catalog/products/nba.png"
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
                            "TPM-ADOBE-001",
                            "adobe-creative-cloud",
                            "Adobe Creative Cloud",
                            "Acesso premium para ferramentas criativas e edicao.",
                            ProductCategory.ASSINATURA,
                            "ADOBE",
                            2499L,
                            30,
                            "Entrega por credencial com orientacao de uso individual.",
                            5,
                            "softwares-licencas",
                            "/catalog/products/adobe.png"
                    ),
                    new CatalogProductSeed(
                            "TPM-CAPCUT-001",
                            "capcut-pro",
                            "CapCut Pro",
                            "Assinatura para edicao de videos e recursos premium.",
                            ProductCategory.ASSINATURA,
                            "CAPCUT",
                            1499L,
                            30,
                            "Entrega por credencial com vigencia operacional de 30 dias.",
                            5,
                            "softwares-licencas",
                            "/catalog/products/capcut.png"
                    ),
                    new CatalogProductSeed(
                            "TPM-COPILOT-001",
                            "copilot-pro",
                            "Copilot Pro",
                            "Acesso premium de IA para produtividade e assistencia digital.",
                            ProductCategory.ASSINATURA,
                            "COPILOT",
                            2599L,
                            30,
                            "Entrega por credencial com orientacao de uso individual.",
                            5,
                            "inteligencia-artificial",
                            "/catalog/products/copilot.png"
                    ),
                    new CatalogProductSeed(
                            "TPM-MIDJOURNEY-001",
                            "midjourney",
                            "Midjourney",
                            "Acesso a geracao de imagens por IA.",
                            ProductCategory.ASSINATURA,
                            "MIDJOURNEY",
                            2999L,
                            30,
                            "Entrega por credencial com vigencia operacional de 30 dias.",
                            4,
                            "inteligencia-artificial",
                            "/catalog/products/midjourney.png"
                    ),
                    new CatalogProductSeed(
                            "TPM-NOTION-001",
                            "notion-plus",
                            "Notion Plus",
                            "Workspace premium para notas, projetos e documentos.",
                            ProductCategory.ASSINATURA,
                            "NOTION",
                            1299L,
                            30,
                            "Entrega por credencial com uso individual.",
                            5,
                            "assinaturas-premium",
                            "/catalog/products/notion.png"
                    ),
                    new CatalogProductSeed(
                            "TPM-DROPBOX-001",
                            "dropbox-plus",
                            "Dropbox Plus",
                            "Armazenamento em nuvem com recursos premium.",
                            ProductCategory.ASSINATURA,
                            "DROPBOX",
                            1499L,
                            30,
                            "Entrega por credencial com vigencia operacional de 30 dias.",
                            5,
                            "assinaturas-premium",
                            "/catalog/products/dropbox.png"
                    ),
                    new CatalogProductSeed(
                            "TPM-GDRIVE-001",
                            "google-drive",
                            "Google Drive",
                            "Acesso digital para armazenamento e produtividade em nuvem.",
                            ProductCategory.ASSINATURA,
                            "GOOGLE_DRIVE",
                            1299L,
                            30,
                            "Entrega por credencial com orientacao de uso individual.",
                            5,
                            "assinaturas-premium",
                            "/catalog/products/googledrive.png"
                    ),
                    new CatalogProductSeed(
                            "TPM-ICLOUD-001",
                            "icloud-plus",
                            "iCloud+",
                            "Armazenamento e recursos premium para conta digital.",
                            ProductCategory.ASSINATURA,
                            "ICLOUD",
                            1299L,
                            30,
                            "Entrega por credencial com vigencia operacional de 30 dias.",
                            5,
                            "contas-digitais",
                            "/catalog/products/icloud.png"
                    ),
                    new CatalogProductSeed(
                            "TPM-GITHUB-001",
                            "github-pro",
                            "GitHub Pro",
                            "Acesso premium para desenvolvimento e repositorios.",
                            ProductCategory.ASSINATURA,
                            "GITHUB",
                            1999L,
                            30,
                            "Entrega por credencial com uso individual.",
                            4,
                            "softwares-licencas",
                            "/catalog/products/github.png"
                    ),
                    new CatalogProductSeed(
                            "TPM-VSCODE-001",
                            "vscode-tools",
                            "VS Code Tools",
                            "Pacote digital para produtividade e desenvolvimento.",
                            ProductCategory.ASSINATURA,
                            "VSCODE",
                            999L,
                            30,
                            "Entrega por credencial ou instrucoes operacionais.",
                            4,
                            "softwares-licencas",
                            "/catalog/products/vscode.png"
                    ),
                    new CatalogProductSeed(
                            "TPM-DUOLINGO-001",
                            "duolingo-super",
                            "Duolingo Super",
                            "Acesso premium para estudos e pratica de idiomas.",
                            ProductCategory.ASSINATURA,
                            "DUOLINGO",
                            999L,
                            30,
                            "Entrega por credencial com vigencia operacional de 30 dias.",
                            5,
                            "cursos-treinamentos",
                            "/catalog/products/duolinguo.png"
                    ),
                    new CatalogProductSeed(
                            "TPM-SPOTIFY-001",
                            "spotify-premium",
                            "Spotify Premium",
                            "Streaming de musica com recursos premium.",
                            ProductCategory.STREAMING,
                            "SPOTIFY",
                            999L,
                            30,
                            "Entrega por credencial com vigencia operacional de 30 dias.",
                            6,
                            "streaming",
                            "/catalog/products/spotify.png"
                    ),
                    new CatalogProductSeed(
                            "TPM-TWITCH-001",
                            "twitch-premium",
                            "Twitch Premium",
                            "Acesso digital para comunidade, lives e beneficios premium.",
                            ProductCategory.STREAMING,
                            "TWITCH",
                            999L,
                            30,
                            "Entrega por credencial com uso regional BR.",
                            4,
                            "streaming",
                            "/catalog/products/twicth.png"
                    ),
                    new CatalogProductSeed(
                            "TPM-STEAM-001",
                            "steam",
                            "Steam",
                            "Conta ou credito digital para plataforma de jogos.",
                            ProductCategory.GAMES,
                            "STEAM",
                            1999L,
                            0,
                            "Entrega de acesso digital com instrucoes operacionais.",
                            5,
                            "games",
                            "/catalog/products/steam.png"
                    ),
                    new CatalogProductSeed(
                            "TPM-XBOX-001",
                            "xbox",
                            "Xbox",
                            "Produto digital para jogos, conta ou beneficios Xbox.",
                            ProductCategory.GAMES,
                            "XBOX",
                            1999L,
                            0,
                            "Entrega de acesso digital com instrucoes operacionais.",
                            5,
                            "games",
                            "/catalog/products/xbox.png"
                    ),
                    new CatalogProductSeed(
                            "TPM-ROBLOX-001",
                            "roblox",
                            "Roblox",
                            "Produto digital para conta, creditos ou beneficios Roblox.",
                            ProductCategory.GAMES,
                            "ROBLOX",
                            1499L,
                            0,
                            "Entrega de acesso digital com instrucoes operacionais.",
                            5,
                            "games",
                            "/catalog/products/roblox.png"
                    ),
                    new CatalogProductSeed(
                            "TPM-NINTENDO-001",
                            "nintendo",
                            "Nintendo",
                            "Produto digital para conta, jogos ou beneficios Nintendo.",
                            ProductCategory.GAMES,
                            "NINTENDO",
                            1999L,
                            0,
                            "Entrega de acesso digital com instrucoes operacionais.",
                            4,
                            "games",
                            "/catalog/products/nintendp.png"
                    ),
                    new CatalogProductSeed(
                            "TPM-DISCORD-001",
                            "discord-nitro",
                            "Discord Nitro",
                            "Acesso premium para comunidade, chamadas e recursos sociais.",
                            ProductCategory.ASSINATURA,
                            "DISCORD",
                            1499L,
                            30,
                            "Entrega por credencial com vigencia operacional de 30 dias.",
                            5,
                            "redes-sociais",
                            "/catalog/products/discord.png"
                    ),
                    new CatalogProductSeed(
                            "TPM-INSTAGRAM-001",
                            "instagram",
                            "Instagram",
                            "Servico digital para perfil e operacao em rede social.",
                            ProductCategory.ASSINATURA,
                            "INSTAGRAM",
                            999L,
                            30,
                            "Entrega conforme instrucoes operacionais do servico.",
                            5,
                            "redes-sociais",
                            "/catalog/products/instagrram.png"
                    ),
                    new CatalogProductSeed(
                            "TPM-LINKEDIN-001",
                            "linkedin-premium",
                            "LinkedIn Premium",
                            "Acesso premium para networking e carreira.",
                            ProductCategory.ASSINATURA,
                            "LINKEDIN",
                            1999L,
                            30,
                            "Entrega por credencial com vigencia operacional de 30 dias.",
                            4,
                            "redes-sociais",
                            "/catalog/products/linkedin.png"
                    ),
                    new CatalogProductSeed(
                            "TPM-PINTEREST-001",
                            "pinterest",
                            "Pinterest",
                            "Servico digital para perfil e operacao em rede social.",
                            ProductCategory.ASSINATURA,
                            "PINTEREST",
                            999L,
                            30,
                            "Entrega conforme instrucoes operacionais do servico.",
                            4,
                            "redes-sociais",
                            "/catalog/products/pinterest.png"
                    ),
                    new CatalogProductSeed(
                            "TPM-REDDIT-001",
                            "reddit-premium",
                            "Reddit Premium",
                            "Acesso premium e beneficios para comunidade digital.",
                            ProductCategory.ASSINATURA,
                            "REDDIT",
                            999L,
                            30,
                            "Entrega por credencial com vigencia operacional de 30 dias.",
                            4,
                            "redes-sociais",
                            "/catalog/products/reddit.png"
                    ),
                    new CatalogProductSeed(
                            "TPM-SNAPCHAT-001",
                            "snapchat-plus",
                            "Snapchat+",
                            "Acesso premium para rede social e recursos extras.",
                            ProductCategory.ASSINATURA,
                            "SNAPCHAT",
                            999L,
                            30,
                            "Entrega por credencial com vigencia operacional de 30 dias.",
                            4,
                            "redes-sociais",
                            "/catalog/products/snapchat.png"
                    ),
                    new CatalogProductSeed(
                            "TPM-TELEGRAM-001",
                            "telegram-premium",
                            "Telegram Premium",
                            "Acesso premium para mensagens, arquivos e comunidade.",
                            ProductCategory.ASSINATURA,
                            "TELEGRAM",
                            999L,
                            30,
                            "Entrega por credencial com vigencia operacional de 30 dias.",
                            4,
                            "redes-sociais",
                            "/catalog/products/telegram.png"
                    ),
                    new CatalogProductSeed(
                            "TPM-TIKTOK-001",
                            "tiktok",
                            "TikTok",
                            "Servico digital para perfil e operacao em rede social.",
                            ProductCategory.ASSINATURA,
                            "TIKTOK",
                            999L,
                            30,
                            "Entrega conforme instrucoes operacionais do servico.",
                            5,
                            "redes-sociais",
                            "/catalog/products/tiktok.png"
                    ),
                    new CatalogProductSeed(
                            "TPM-WHATSAPP-001",
                            "whatsapp-business",
                            "WhatsApp Business",
                            "Servico digital para conta, atendimento e operacao.",
                            ProductCategory.ASSINATURA,
                            "WHATSAPP",
                            999L,
                            30,
                            "Entrega conforme instrucoes operacionais do servico.",
                            5,
                            "redes-sociais",
                            "/catalog/products/whatsapp.png"
                    ),
                    new CatalogProductSeed(
                            "TPM-X-001",
                            "x-premium",
                            "X Premium",
                            "Acesso premium para rede social X.",
                            ProductCategory.ASSINATURA,
                            "X",
                            1499L,
                            30,
                            "Entrega por credencial com vigencia operacional de 30 dias.",
                            4,
                            "redes-sociais",
                            "/catalog/products/x.png"
                    ),
                    new CatalogProductSeed(
                            "TPM-PAYPAL-001",
                            "paypal",
                            "PayPal",
                            "Conta digital ou servico operacional para pagamentos.",
                            ProductCategory.ASSINATURA,
                            "PAYPAL",
                            1499L,
                            30,
                            "Entrega conforme instrucoes operacionais do servico.",
                            4,
                            "contas-digitais",
                            "/catalog/products/paypal.png"
                    ),
                    new CatalogProductSeed(
                            "TPM-TEKNISA-001",
                            "teknisa",
                            "Teknisa",
                            "Acesso digital para software e operacao profissional.",
                            ProductCategory.ASSINATURA,
                            "TEKNISA",
                            1999L,
                            30,
                            "Entrega por credencial com vigencia operacional de 30 dias.",
                            3,
                            "servicos-digitais",
                            "/catalog/products/teknisa.png"
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
                            3,
                            "games",
                            "/catalog/products/lol.png"
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
                            4,
                            "games",
                            "/catalog/products/lol.png"
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
                            2,
                            "games",
                            "/catalog/products/lol.png"
                    ),
                    new CatalogProductSeed(
                            "TPM-LOL-FERRO-001",
                            "lol-ferro",
                            "Conta LoL Ferro",
                            "Conta de League of Legends pronta para uso em tier Ferro.",
                            ProductCategory.GAMES,
                            ProductProvider.LEAGUE_OF_LEGENDS,
                            5990L,
                            0,
                            "Entrega de conta individual com troca imediata de acesso recomendada.",
                            3,
                            "games",
                            "/catalog/products/lol.png"
                    ),
                    new CatalogProductSeed(
                            "TPM-LOL-BRONZE-001",
                            "lol-bronze",
                            "Conta LoL Bronze",
                            "Conta de League of Legends pronta para uso em tier Bronze.",
                            ProductCategory.GAMES,
                            ProductProvider.LEAGUE_OF_LEGENDS,
                            7990L,
                            0,
                            "Entrega de conta individual com troca imediata de acesso recomendada.",
                            3,
                            "games",
                            "/catalog/products/lol.png"
                    ),
                    new CatalogProductSeed(
                            "TPM-LOL-PRATA-001",
                            "lol-prata",
                            "Conta LoL Prata",
                            "Conta de League of Legends pronta para uso em tier Prata.",
                            ProductCategory.GAMES,
                            ProductProvider.LEAGUE_OF_LEGENDS,
                            9990L,
                            0,
                            "Entrega de conta individual com troca imediata de acesso recomendada.",
                            3,
                            "games",
                            "/catalog/products/lol.png"
                    ),
                    new CatalogProductSeed(
                            "TPM-LOL-OURO-001",
                            "lol-ouro",
                            "Conta LoL Ouro",
                            "Conta de League of Legends pronta para uso em tier Ouro.",
                            ProductCategory.GAMES,
                            ProductProvider.LEAGUE_OF_LEGENDS,
                            12990L,
                            0,
                            "Entrega de conta individual com troca imediata de acesso recomendada.",
                            3,
                            "games",
                            "/catalog/products/lol.png"
                    ),
                    new CatalogProductSeed(
                            "TPM-LOL-ESMERALDA-001",
                            "lol-esmeralda",
                            "Conta LoL Esmeralda",
                            "Conta de League of Legends pronta para uso em tier Esmeralda.",
                            ProductCategory.GAMES,
                            ProductProvider.LEAGUE_OF_LEGENDS,
                            18990L,
                            0,
                            "Entrega de conta individual com troca imediata de acesso recomendada.",
                            3,
                            "games",
                            "/catalog/products/lol.png"
                    ),
                    new CatalogProductSeed(
                            "TPM-LOL-MESTRE-001",
                            "lol-mestre",
                            "Conta LoL Mestre",
                            "Conta de League of Legends pronta para uso em tier Mestre.",
                            ProductCategory.GAMES,
                            ProductProvider.LEAGUE_OF_LEGENDS,
                            44990L,
                            0,
                            "Entrega de conta individual com prioridade operacional.",
                            2,
                            "games",
                            "/catalog/products/lol.png"
                    ),
                    new CatalogProductSeed(
                            "TPM-DOTA-ANCIENT-001",
                            "dota-ancient",
                            "Conta Dota Ancient",
                            "Conta de Dota 2 pronta para uso em tier Ancient.",
                            ProductCategory.GAMES,
                            "DOTA_2",
                            18990L,
                            0,
                            "Entrega de conta individual com troca imediata de acesso recomendada.",
                            3,
                            "games",
                            "/catalog/products/dota.png"
                    ),
                    new CatalogProductSeed(
                            "TPM-DOTA-DIVINE-001",
                            "dota-divine",
                            "Conta Dota Divine",
                            "Conta de Dota 2 pronta para uso em tier Divine.",
                            ProductCategory.GAMES,
                            "DOTA_2",
                            28990L,
                            0,
                            "Entrega de conta individual com troca imediata de acesso recomendada.",
                            3,
                            "games",
                            "/catalog/products/dota.png"
                    ),
                    new CatalogProductSeed(
                            "TPM-DOTA-IMMORTAL-001",
                            "dota-immortal",
                            "Conta Dota Immortal",
                            "Conta de Dota 2 pronta para uso em tier Immortal.",
                            ProductCategory.GAMES,
                            "DOTA_2",
                            49990L,
                            0,
                            "Entrega de conta individual com prioridade operacional.",
                            2,
                            "games",
                            "/catalog/products/dota.png"
                    )
            );

            List<ProductEntity> products = seeds.stream()
                    .map(seed -> upsertProduct(productRepository, catalogCategoryRepository, seed))
                    .toList();

            seeds.forEach(seed -> {
                ProductEntity product = products.stream()
                        .filter(item -> item.getSku().equals(seed.sku()))
                        .findFirst()
                        .orElseThrow();
                seedCredentialsForProduct(credentialRepository, product, seed, credentialCryptoService);
            });

            migrateLegacyCredentials(credentialRepository, credentialCryptoService);
    }

    private ProductEntity upsertProduct(
            ProductRepository productRepository,
            CatalogCategoryRepository catalogCategoryRepository,
            CatalogProductSeed seed
    ) {
        ProductEntity product = productRepository.findBySku(seed.sku()).orElseGet(ProductEntity::new);
        product.setSku(seed.sku());
        product.setSlug(seed.slug());
        product.setName(seed.name());
        product.setDescription(seed.description());
        product.setImageUrl(seed.imageUrl());
        product.setCategory(seed.category());
        product.setCatalogCategory(catalogCategoryRepository.findBySlug(resolveSeedCategorySlug(seed)).orElseThrow());
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
            CatalogProductSeed seed,
            CredentialCryptoService credentialCryptoService
    ) {
        long existingCredentials = credentialRepository.countByProduct_Id(product.getId());
        if (existingCredentials >= seed.stockCount()) {
            return;
        }

        long existingAvailableCredentials = credentialRepository.countByProduct_IdAndStatus(product.getId(), CredentialStatus.AVAILABLE);
        long missingCredentials = seed.stockCount() - existingCredentials;
        long startingIndex = existingCredentials + 1;

        for (long offset = 0; offset < missingCredentials; offset++) {
            long index = startingIndex + offset;
            CredentialEntity credential = new CredentialEntity();
            credential.setProduct(product);
            credential.setLoginEncrypted(credentialCryptoService.encrypt("login+" + seed.slug() + index + "@thepiratemax.local"));
            credential.setPasswordEncrypted(credentialCryptoService.encrypt(seed.slug() + "-pass-" + index));
            credential.setEncryptionKeyVersion(credentialCryptoService.currentKeyVersion());
            credential.setStatus(CredentialStatus.AVAILABLE);
            credential.setSourceBatch(seed.slug() + "-batch-" + (existingAvailableCredentials > 0 ? "topup" : "001"));
            credentialRepository.save(credential);
        }
    }

    private String resolveSeedCategorySlug(CatalogProductSeed seed) {
        if (seed.catalogCategorySlug() != null && !seed.catalogCategorySlug().isBlank()) {
            return seed.catalogCategorySlug();
        }
        if (seed.category() == ProductCategory.STREAMING) {
            return "streaming";
        }
        if (seed.category() == ProductCategory.GAMES) {
            return "games";
        }
        String haystack = (seed.name() + " " + seed.provider() + " " + seed.slug()).toLowerCase();
        if (haystack.contains("chatgpt") || haystack.contains("gemini") || haystack.contains("ia")) {
            return "inteligencia-artificial";
        }
        return "assinaturas-premium";
    }

    private void upsertUser(
            UserRepository userRepository,
            String email,
            String name,
            UserRole role,
            String rawPassword,
            PasswordEncoder passwordEncoder
    ) {
        UserEntity user = userRepository.findByEmail(email).orElseGet(UserEntity::new);
        user.setEmail(email);
        user.setName(name);
        user.setRole(role);
        user.setStatus(UserStatus.ACTIVE);
        user.setPasswordHash(passwordEncoder.encode(rawPassword));
        userRepository.save(user);
    }

    private void migrateLegacyCredentials(
            CredentialRepository credentialRepository,
            CredentialCryptoService credentialCryptoService
    ) {
        credentialRepository.findByEncryptionKeyVersion("dev-v1").forEach(credential -> {
            String login = credentialCryptoService.decrypt(credential.getLoginEncrypted(), credential.getEncryptionKeyVersion());
            String password = credentialCryptoService.decrypt(credential.getPasswordEncrypted(), credential.getEncryptionKeyVersion());
            credential.setLoginEncrypted(credentialCryptoService.encrypt(login));
            credential.setPasswordEncrypted(credentialCryptoService.encrypt(password));
            credential.setEncryptionKeyVersion(credentialCryptoService.currentKeyVersion());
            credentialRepository.save(credential);
        });
    }
}
