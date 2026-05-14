import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowRight, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { apiClient } from "../shared/api/client";
import { useCart } from "../shared/cart/CartContext";
import { formatCurrency, humanizeCategory } from "../shared/lib/format";
import { useSession } from "../shared/session/SessionContext";
import type { CatalogCategory, InventoryItem, Product } from "../shared/types";

type CatalogSection = {
  id: string;
  title: string;
  summary: string;
  products: Product[];
};

const FALLBACK_CATEGORIES: CatalogCategory[] = [
  { id: "fallback-ia", name: "Inteligencia Artificial", slug: "inteligencia-artificial", description: "ChatGPT, Gemini e ferramentas", imageUrl: null, sortOrder: 10, active: true },
  { id: "fallback-assinaturas", name: "Assinaturas e Premium", slug: "assinaturas-premium", description: "Softwares e acessos premium", imageUrl: null, sortOrder: 20, active: true },
  { id: "fallback-streaming", name: "Streaming", slug: "streaming", description: "Entretenimento digital", imageUrl: null, sortOrder: 30, active: true },
  { id: "fallback-games", name: "Games", slug: "games", description: "Contas, creditos e jogos", imageUrl: null, sortOrder: 40, active: true },
  { id: "fallback-gift-cards", name: "Gift Cards", slug: "gift-cards", description: "Cartoes digitais e creditos", imageUrl: null, sortOrder: 50, active: true },
  { id: "fallback-softwares", name: "Softwares e Licencas", slug: "softwares-licencas", description: "Chaves e ferramentas", imageUrl: null, sortOrder: 60, active: true },
  { id: "fallback-redes", name: "Redes Sociais", slug: "redes-sociais", description: "Servicos para plataformas sociais", imageUrl: null, sortOrder: 70, active: true },
  { id: "fallback-servicos", name: "Servicos Digitais", slug: "servicos-digitais", description: "Operacoes digitais sob demanda", imageUrl: null, sortOrder: 80, active: true },
  { id: "fallback-cursos", name: "Cursos e Treinamentos", slug: "cursos-treinamentos", description: "Conteudos e formacoes", imageUrl: null, sortOrder: 90, active: true },
  { id: "fallback-contas", name: "Contas Digitais", slug: "contas-digitais", description: "Acessos e perfis digitais", imageUrl: null, sortOrder: 100, active: true }
];

const CATEGORY_IMAGE_BY_SLUG: Record<string, string> = {
  "inteligencia-artificial": "/catalog/categories/IA.webp",
  "assinaturas-premium": "/catalog/categories/Assinaturas e Premium.webp",
  streaming: "/catalog/categories/Streming.webp",
  games: "/catalog/categories/Games.webp",
  "gift-cards": "/catalog/categories/Gift Cards.webp",
  "softwares-licencas": "/catalog/categories/Software%20e%20Licen%C3%A7as.webp",
  "redes-sociais": "/catalog/categories/Redes Sociais.webp",
  "servicos-digitais": "/catalog/categories/Servi%C3%A7os%20Digitais.webp",
  "cursos-treinamentos": "/catalog/categories/Cursos e Treinamentos.webp",
  "contas-digitais": "/catalog/categories/Contas Digitais.webp"
};

const PRODUCT_IMAGE_BY_KEY: Record<string, string> = {
  adobe: "/catalog/products/adobe.webp",
  "amazon-prime": "/catalog/products/prime.webp",
  canva: "/catalog/products/canva.webp",
  capcut: "/catalog/products/capcut.webp",
  claude: "/catalog/products/claude.webp",
  "chatgpt-plus": "/catalog/products/gpt.webp",
  chatgpt: "/catalog/products/gpt.webp",
  copilot: "/catalog/products/copilot.webp",
  crunchyroll: "/catalog/products/cruchyroll.webp",
  discord: "/catalog/products/discord.webp",
  dota: "/catalog/products/dota.webp",
  "dota-2": "/catalog/products/dota.webp",
  "disney-plus": "/catalog/products/disney.webp",
  disney: "/catalog/products/disney.webp",
  dropbox: "/catalog/products/dropbox.webp",
  duolingo: "/catalog/products/duolinguo.webp",
  figma: "/catalog/products/Figma.webp",
  github: "/catalog/products/github.webp",
  "google-drive": "/catalog/products/googledrive.webp",
  googledrive: "/catalog/products/googledrive.webp",
  gpt: "/catalog/products/gpt.webp",
  hulu: "/catalog/products/hulu.webp",
  icloud: "/catalog/products/icloud.webp",
  instagram: "/catalog/products/instagrram.webp",
  "league-of-legends": "/catalog/products/lol.webp",
  lol: "/catalog/products/lol.webp",
  linkedin: "/catalog/products/linkedin.webp",
  midjourney: "/catalog/products/midjourney.webp",
  "nba-league-pass": "/catalog/products/nba.webp",
  nba: "/catalog/products/nba.webp",
  netflix: "/catalog/products/netflix.webp",
  nintendo: "/catalog/products/nintendp.webp",
  notion: "/catalog/products/notion.webp",
  "paramount-plus": "/catalog/products/paramount.webp",
  paramount: "/catalog/products/paramount.webp",
  paypal: "/catalog/products/paypal.webp",
  pinterest: "/catalog/products/pinterest.webp",
  prime: "/catalog/products/prime.webp",
  reddit: "/catalog/products/reddit.webp",
  roblox: "/catalog/products/roblox.webp",
  snapchat: "/catalog/products/snapchat.webp",
  spotify: "/catalog/products/spotify.webp",
  steam: "/catalog/products/steam.webp",
  teknisa: "/catalog/products/teknisa.webp",
  telegram: "/catalog/products/telegram.webp",
  tiktok: "/catalog/products/tiktok.webp",
  twitch: "/catalog/products/twicth.webp",
  antigravity: "/catalog/products/antigravity.webp",
  vscode: "/catalog/products/vscode.webp",
  whatsapp: "/catalog/products/whatsapp.webp",
  "x-premium": "/catalog/products/x.webp",
  xbox: "/catalog/products/xbox.webp",
  youtube: "/catalog/products/youtube.webp"
};

const PRODUCT_IMAGE_BY_SLUG: Record<string, string> = {
  hulu: "/catalog/products/hulu.webp",
  "nba-league-pass": "/catalog/products/nba.webp",
  "lol-diamante-1": "/catalog/products/lol.webp",
  "lol-platina-2": "/catalog/products/lol.webp",
  "lol-desafiante": "/catalog/products/lol.webp",
  "lol-ferro": "/catalog/products/lol.webp",
  "lol-bronze": "/catalog/products/lol.webp",
  "lol-prata": "/catalog/products/lol.webp",
  "lol-ouro": "/catalog/products/lol.webp",
  "lol-esmeralda": "/catalog/products/lol.webp",
  "lol-mestre": "/catalog/products/lol.webp",
  "dota-ancient": "/catalog/products/dota.webp",
  "dota-divine": "/catalog/products/dota.webp",
  "dota-immortal": "/catalog/products/dota.webp"
};

const PRODUCT_IMAGE_BY_SKU: Record<string, string> = {
  "TPM-HULU-001": "/catalog/products/hulu.webp",
  "TPM-NBA-001": "/catalog/products/nba.webp",
  "TPM-LOL-D1-001": "/catalog/products/lol.webp",
  "TPM-LOL-P2-001": "/catalog/products/lol.webp",
  "TPM-LOL-CHALL-001": "/catalog/products/lol.webp",
  "TPM-LOL-FERRO-001": "/catalog/products/lol.webp",
  "TPM-LOL-BRONZE-001": "/catalog/products/lol.webp",
  "TPM-LOL-PRATA-001": "/catalog/products/lol.webp",
  "TPM-LOL-OURO-001": "/catalog/products/lol.webp",
  "TPM-LOL-ESMERALDA-001": "/catalog/products/lol.webp",
  "TPM-LOL-MESTRE-001": "/catalog/products/lol.webp",
  "TPM-DOTA-ANCIENT-001": "/catalog/products/dota.webp",
  "TPM-DOTA-DIVINE-001": "/catalog/products/dota.webp",
  "TPM-DOTA-IMMORTAL-001": "/catalog/products/dota.webp"
};

export function CatalogPage() {
  const { apiBase } = useSession();
  const { addItem } = useCart();
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<CatalogCategory[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [recentlyAddedProductId, setRecentlyAddedProductId] = useState<string | null>(null);
  const search = searchParams.get("busca") || "";

  function addProductToCart(product: Product) {
    addItem(product);
    setRecentlyAddedProductId(product.id);
    window.setTimeout(() => setRecentlyAddedProductId((current) => current === product.id ? null : current), 1400);
  }

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      setLoadError("");
      try {
        const [productsResponse, inventoryResponse, categoriesResponse] = await Promise.all([
          apiClient.getProducts(apiBase),
          apiClient.getInventory(apiBase),
          apiClient.getCategories(apiBase).catch(() => FALLBACK_CATEGORIES)
        ]);
        setProducts(productsResponse);
        setInventory(inventoryResponse);
        setCategories(categoriesResponse.length > 0 ? categoriesResponse : FALLBACK_CATEGORIES);
      } catch {
        setProducts([]);
        setInventory([]);
        setCategories(FALLBACK_CATEGORIES);
        setLoadError("Nao foi possivel carregar o catalogo a partir do backend atual.");
      } finally {
        setIsLoading(false);
      }
    }

    void load();
  }, [apiBase]);

  const mergedProducts = useMemo(() => products.map((product) => {
    const stock = inventory.find((item) => item.sku === product.sku)?.availableStock ?? product.availableStock ?? 0;
    return { ...product, availableStock: stock };
  }), [inventory, products]);

  const filteredProducts = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return mergedProducts;
    return mergedProducts.filter((product) => (
      `${product.name} ${product.provider} ${product.description} ${product.sku}`.toLowerCase().includes(term)
    ));
  }, [mergedProducts, search]);

  const homeCategories = categories.length > 0 ? categories : FALLBACK_CATEGORIES;
  const catalogSections = useMemo(() => buildCatalogSections(filteredProducts, homeCategories), [filteredProducts, homeCategories]);

  return (
    <div className="page-section">
      <section className="catalog-intro">
        <div className="catalog-wordmark">
          <h1 aria-label="The Pirate Max">
            <span>The</span>
            <span className="word-pirate">P<span className="pirate-i">ı</span>rate</span>
            <span className="word-max">Max</span>
          </h1>
          <span aria-hidden="true">®</span>
        </div>
        <div className="catalog-intro-actions">
          <p>Produtos digitais organizados por categoria, com PIX e entrega acompanhavel.</p>
        </div>
      </section>

      <section className="popular-categories" aria-label="Categorias populares">
        <div className="section-heading">
          <h2>Categorias populares</h2>
          <a href="#catalog-sections">Ver catalogo <ArrowRight size={15} /></a>
        </div>
        <ScrollableRail className="popular-category-rail" label="Navegar categorias populares" variant="category">
          {homeCategories.slice(0, 10).map((category) => {
            const imageUrl = getCategoryImageUrl(category);
            return (
              <Link key={category.id} to={`/categoria/${category.slug}`} className="popular-category-card">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={category.name}
                    loading="lazy"
                    onError={(event) => { event.currentTarget.style.display = "none"; }}
                  />
                ) : null}
              </Link>
            );
          })}
        </ScrollableRail>
      </section>

      <section className="catalog-toolbar">
        <label className="catalog-search-field">
          <Search size={18} />
        <input
          className="toolbar-search"
          value={search}
          onChange={(event) => setSearchParams(event.target.value ? { busca: event.target.value } : {})}
          placeholder="Buscar produto ou provedor"
          aria-label="Buscar no catalogo"
        />
        </label>
      </section>

      <section className="catalog-sections" id="catalog-sections">
        {!isLoading && loadError ? (
          <div className="empty-state-panel">
            <strong>Catalogo indisponivel</strong>
            <p>{loadError}</p>
            <button type="button" className="secondary-button compact" onClick={() => window.location.reload()}>Tentar novamente</button>
          </div>
        ) : null}
        {isLoading ? (
          <LoadingCatalogSections />
        ) : catalogSections.length > 0 ? (
          catalogSections.map((section) => (
            <CatalogProductSection
              key={section.id}
              section={section}
              onAdd={addProductToCart}
              recentlyAddedProductId={recentlyAddedProductId}
            />
          ))
        ) : (
          <div className="empty-state-panel">
            <strong>Nenhum produto encontrado</strong>
            <p>Tente buscar por outro termo ou limpar o campo de busca.</p>
            <button type="button" className="secondary-button compact" onClick={() => setSearchParams({})}>Limpar busca</button>
          </div>
        )}
      </section>
    </div>
  );
}

function CatalogProductSection({
  section,
  onAdd,
  recentlyAddedProductId
}: {
  section: CatalogSection;
  onAdd: (product: Product) => void;
  recentlyAddedProductId: string | null;
}) {
  return (
    <section className="catalog-product-section" id={section.id}>
      <div className="section-heading">
        <div>
          <h2>{section.title}</h2>
          <p>{section.summary}</p>
        </div>
        <Link to={`/categoria/${section.id}`}>Ver mais <ArrowRight size={15} /></Link>
      </div>
      {section.products.length > 0 ? (
        <ScrollableRail className="product-rail" label={`Navegar produtos de ${section.title}`}>
          {section.products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAdd={onAdd}
              isRecentlyAdded={recentlyAddedProductId === product.id}
            />
          ))}
        </ScrollableRail>
      ) : (
        <div className="category-empty-row">Novos produtos em breve.</div>
      )}
    </section>
  );
}

function ScrollableRail({
  className,
  label,
  variant = "default",
  children
}: {
  className: string;
  label: string;
  variant?: "default" | "category";
  children: ReactNode;
}) {
  const railRef = useRef<HTMLDivElement | null>(null);
  const [canScrollPrevious, setCanScrollPrevious] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;

    function updateScrollState() {
      if (!rail) return;
      const maxScroll = rail.scrollWidth - rail.clientWidth;
      setCanScrollPrevious(rail.scrollLeft > 4);
      setCanScrollNext(rail.scrollLeft < maxScroll - 4);
    }

    updateScrollState();
    rail.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);
    return () => {
      rail.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, [children]);

  function scrollRail(direction: "previous" | "next") {
    const rail = railRef.current;
    if (!rail) return;
    const distance = Math.max(rail.clientWidth * 0.82, 260);
    rail.scrollBy({
      left: direction === "next" ? distance : -distance,
      behavior: "smooth"
    });
  }

  return (
    <div className={`rail-frame rail-frame-${variant} ${canScrollPrevious ? "has-previous" : ""} ${canScrollNext ? "has-next" : ""}`}>
      <button
        type="button"
        className="rail-nav rail-nav-prev"
        aria-label={`${label} para esquerda`}
        disabled={!canScrollPrevious}
        onClick={() => scrollRail("previous")}
      >
        <ChevronLeft size={22} strokeWidth={2.2} />
      </button>
      <div ref={railRef} className={className} tabIndex={0}>
        {children}
      </div>
      <button
        type="button"
        className="rail-nav rail-nav-next"
        aria-label={`${label} para direita`}
        disabled={!canScrollNext}
        onClick={() => scrollRail("next")}
      >
        <ChevronRight size={22} strokeWidth={2.2} />
      </button>
    </div>
  );
}

function ProductCard({
  product,
  onAdd,
  isRecentlyAdded
}: {
  product: Product;
  onAdd: (product: Product) => void;
  isRecentlyAdded: boolean;
}) {
  const imageUrl = getProductImageUrl(product);
  const price = formatPriceParts(product.priceCents);

  return (
    <article className="product-card rail-product-card">
      <div className={`product-visual product-visual-${(product.categorySlug || product.category).toLowerCase()}`}>
        <Link to={`/produto/${product.slug}`} className="product-visual-link" aria-label={`Ver ${product.name}`}>
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.name}
            loading="lazy"
            onError={(event) => {
              const fallbackImageUrl = getProductImageFallbackUrl(product);
              if (fallbackImageUrl && event.currentTarget.src !== new URL(fallbackImageUrl, window.location.origin).href) {
                event.currentTarget.src = fallbackImageUrl;
                return;
              }
              event.currentTarget.style.display = "none";
            }}
          />
        ) : <ProductImageFallback product={product} />}
        </Link>
      </div>
      <div className="product-body">
        <h3><Link to={`/produto/${product.slug}`}>{product.name}</Link></h3>
        <p>{product.description}</p>
        <div className="product-price">
          <span>{price.currency}</span>
          <strong>{price.amount}</strong>
        </div>
        <div className="product-footer">
          <span className="product-card-meta">{formatCategoryChip(product)}{" \u2022 "}{formatDuration(product.durationDays)}</span>
          <button
            type="button"
            className={isRecentlyAdded ? "product-add-button added" : "product-add-button"}
            onClick={() => onAdd(product)}
          >
            {isRecentlyAdded ? "Adicionado" : "Adicionar"}
          </button>
        </div>
      </div>
    </article>
  );
}

function ProductImageFallback({ product }: { product: Product }) {
  const label = formatCategoryChip(product);
  return (
    <span className="product-image-fallback" aria-hidden="true">
      <span>{label.slice(0, 2).toUpperCase()}</span>
    </span>
  );
}

function LoadingCatalogSections() {
  return (
    <>
      {["loading-a", "loading-b", "loading-c"].map((sectionId) => (
        <section key={sectionId} className="catalog-product-section">
          <div className="section-heading">
            <div className="skeleton-heading" />
          </div>
          <div className="product-rail">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="product-card rail-product-card skeleton-card" />
            ))}
          </div>
        </section>
      ))}
    </>
  );
}

function buildCatalogSections(products: Product[], categories: CatalogCategory[]): CatalogSection[] {
  return categories.map((category) => ({
    id: category.slug,
    title: category.name,
    summary: category.description || "Produtos digitais selecionados para esta categoria.",
    products: products.filter((product) => getProductSectionSlugs(product).includes(category.slug))
  }));
}

function getProductSectionSlugs(product: Product) {
  const primarySlug = product.categorySlug || legacyCategorySlug(product.category);
  const slugs = new Set([primarySlug]);
  const haystack = `${product.slug} ${product.name} ${product.provider} ${product.sku}`.toLowerCase();

  if (haystack.includes("antigravity")) {
    slugs.add("inteligencia-artificial");
  }

  return Array.from(slugs);
}

function formatPriceParts(priceCents: number) {
  const formatted = formatCurrency(priceCents).replace(/\s/g, " ");
  const [currency, ...amountParts] = formatted.split(" ");
  return {
    currency: currency || "R$",
    amount: amountParts.join(" ") || formatted.replace(/^R\$\s?/, "")
  };
}

function formatCategoryChip(product: Product) {
  const label = product.categoryName || humanizeCategory(product.categorySlug || product.category);
  const map: Record<string, string> = {
    "Inteligencia Artificial": "IA",
    "Inteligência Artificial": "IA",
    "Assinaturas e Premium": "Premium",
    "Softwares e Licencas": "Software",
    "Softwares e Licenças": "Software",
    "Redes Sociais": "Social",
    "Servicos Digitais": "Digital",
    "Serviços Digitais": "Digital",
    "Cursos e Treinamentos": "Curso",
    "Contas Digitais": "Conta"
  };
  return map[label] || label;
}

function getCategoryImageUrl(category: CatalogCategory) {
  return normalizeLocalCatalogImageUrl(category.imageUrl) || CATEGORY_IMAGE_BY_SLUG[category.slug] || null;
}

function getProductImageUrl(product: Product) {
  const fallbackImageUrl = getProductImageFallbackUrl(product);
  const productImageUrl = normalizeLocalCatalogImageUrl(product.imageUrl);
  if (productImageUrl && !isGeneratedPlaceholderImage(productImageUrl)) {
    return productImageUrl;
  }
  return fallbackImageUrl;
}

function getProductImageFallbackUrl(product: Product) {
  const explicitBySlug = PRODUCT_IMAGE_BY_SLUG[product.slug];
  if (explicitBySlug) {
    return explicitBySlug;
  }
  const explicitBySku = PRODUCT_IMAGE_BY_SKU[product.sku];
  if (explicitBySku) {
    return explicitBySku;
  }
  const haystack = `${product.slug} ${product.name} ${product.provider} ${product.sku}`.toLowerCase();
  const matchedKey = Object.keys(PRODUCT_IMAGE_BY_KEY).find((key) => haystack.includes(key));
  return matchedKey ? PRODUCT_IMAGE_BY_KEY[matchedKey] : null;
}

function isGeneratedPlaceholderImage(imageUrl: string) {
  return imageUrl.includes("/catalog/products/league-of-legends.webp");
}

function normalizeLocalCatalogImageUrl(imageUrl?: string | null) {
  if (!imageUrl) return null;
  if (!imageUrl.startsWith("/catalog/")) return imageUrl;
  return imageUrl.replace(/\.png($|\?)/i, ".webp$1");
}

function legacyCategorySlug(category: string) {
  const map: Record<string, string> = {
    ASSINATURA: "assinaturas-premium",
    STREAMING: "streaming",
    GAMES: "games"
  };
  return map[category] || category.toLowerCase();
}

function formatDuration(durationDays: number) {
  return durationDays === 0 ? "Vitalicio" : `${durationDays} dias`;
}
