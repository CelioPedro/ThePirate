import { useEffect, useMemo, useState } from "react";
import { ArrowRight, ShieldCheck, Sparkles, WalletCards } from "lucide-react";
import { apiClient } from "../shared/api/client";
import { useCart } from "../shared/cart/CartContext";
import { formatCurrency, humanizeCategory } from "../shared/lib/format";
import { useSession } from "../shared/session/SessionContext";
import type { InventoryItem, Product, ProductCategory } from "../shared/types";

export function CatalogPage() {
  const { apiBase, isLive } = useSession();
  const { addItem, openCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [activeCategory, setActiveCategory] = useState<"ALL" | ProductCategory>("ALL");
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      setLoadError("");
      try {
        const [productsResponse, inventoryResponse] = await Promise.all([
          apiClient.getProducts(apiBase),
          apiClient.getInventory(apiBase)
        ]);
        setProducts(productsResponse);
        setInventory(inventoryResponse);
      } catch {
        setProducts([]);
        setInventory([]);
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

  const filteredProducts = useMemo(() => mergedProducts.filter((product) => {
    if (activeCategory !== "ALL" && product.category !== activeCategory) return false;
    if (!search.trim()) return true;
    return `${product.name} ${product.provider} ${product.description}`.toLowerCase().includes(search.toLowerCase());
  }), [activeCategory, mergedProducts, search]);

  return (
    <div className="page-section">
      <section className="hero-block">
        <div className="hero-copy">
          <span className="eyebrow">catalogo digital</span>
          <h1>Compra simples para produtos digitais com entrega orientada a operacao.</h1>
          <p>
            Streaming, assinaturas e contas selecionadas em um fluxo de compra mais limpo, com PIX,
            historico de pedidos e entrega acompanhavel.
          </p>
          <div className="hero-actions">
            <button type="button" className="primary-button" onClick={openCart}>Abrir carrinho</button>
            <a href="#catalog-grid" className="secondary-button">Explorar catalogo <ArrowRight size={16} /></a>
          </div>
          <div className="hero-points">
            <div><ShieldCheck size={16} /> Status do pedido rastreavel</div>
            <div><WalletCards size={16} /> PIX com fluxo dedicado</div>
            <div><Sparkles size={16} /> Catalogo organizado por categoria</div>
          </div>
        </div>
        <aside className="hero-sidecard">
          <span className="eyebrow">ambiente</span>
          <strong>{isLive ? "Backend conectado" : "Modo offline"}</strong>
          <p>{isLive
            ? "A vitrine, o carrinho e o fluxo de pedido foram reorganizados para separar descoberta, compra e pos-compra."
            : "A aplicacao ainda nao conseguiu falar com a API. Ajuste a URL no topo e tente novamente."}</p>
        </aside>
      </section>

      <section className="catalog-toolbar">
        <div className="category-switcher" role="tablist" aria-label="Categorias">
          {["ALL", "STREAMING", "ASSINATURA", "GAMES"].map((category) => (
            <button
              key={category}
              type="button"
              className={activeCategory === category ? "chip active" : "chip"}
              onClick={() => setActiveCategory(category as "ALL" | ProductCategory)}
            >
              {category === "ALL" ? "Todos" : humanizeCategory(category)}
            </button>
          ))}
        </div>

        <input
          className="toolbar-search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Buscar produto ou provedor"
          aria-label="Buscar no catalogo"
        />
      </section>

      <section className="catalog-layout" id="catalog-grid">
        <div className="catalog-grid">
          {!isLoading && loadError ? (
            <div className="empty-state-panel catalog-empty-span">
              <strong>Catalogo indisponivel</strong>
              <p>{loadError}</p>
            </div>
          ) : null}
          {isLoading ? (
            Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="product-card skeleton-card" />
            ))
          ) : filteredProducts.map((product) => (
            <article key={product.id} className="product-card">
              <div className={`product-visual product-visual-${product.category.toLowerCase()}`}>
                <span>{humanizeCategory(product.category)}</span>
                <strong>{product.provider.replace(/_/g, " ")}</strong>
              </div>
              <div className="product-body">
                <div className="product-meta">
                  <span className="muted-code">{product.sku}</span>
                  <span className={product.availableStock && product.availableStock > 3 ? "stock-pill good" : "stock-pill warn"}>
                    {product.availableStock ?? 0} em estoque
                  </span>
                </div>
                <h3>{product.name}</h3>
                <p>{product.description}</p>
                <div className="product-footer">
                  <div>
                    <strong>{formatCurrency(product.priceCents)}</strong>
                    <span>{humanizeCategory(product.category)}</span>
                  </div>
                  <button type="button" className="secondary-button compact" onClick={() => addItem(product)}>
                    Adicionar
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>

        <aside className="catalog-sidepanel">
          <div className="sidepanel-card">
            <span className="eyebrow">como funciona</span>
            <h3>Fluxo linear de compra</h3>
            <ol className="steps-list">
              <li>Escolha um produto no catalogo</li>
              <li>Finalize no carrinho</li>
              <li>Receba o PIX na tela do pedido</li>
              <li>Acompanhe pagamento, entrega e credenciais</li>
            </ol>
          </div>
          <div className="sidepanel-card">
            <span className="eyebrow">categorias</span>
            <div className="stack-stat">
              <strong>{mergedProducts.filter((item) => item.category === "STREAMING").length}</strong>
              <span>Produtos de streaming</span>
            </div>
            <div className="stack-stat">
              <strong>{mergedProducts.filter((item) => item.category === "ASSINATURA").length}</strong>
              <span>Assinaturas digitais</span>
            </div>
            <div className="stack-stat">
              <strong>{mergedProducts.filter((item) => item.category === "GAMES").length}</strong>
              <span>Contas e produtos de games</span>
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}
