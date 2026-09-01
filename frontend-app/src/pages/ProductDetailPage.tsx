import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Clock3, Headphones, ShieldCheck, ShoppingBag, Zap, Info } from "lucide-react";
import { apiClient } from "../shared/api/client";
import { useCart } from "../shared/cart/CartContext";
import { formatCategoryLabel, getProductImageUrl, getProductSectionSlugs } from "../shared/catalog/catalogData";
import { formatCurrency } from "../shared/lib/format";
import { useDocumentTitle } from "../shared/lib/useDocumentTitle";
import { useSession } from "../shared/session/SessionContext";
import { ProductCard } from "../shared/ui/ProductCard";
import { SafeImage } from "../shared/ui/SafeImage";
import type { InventoryItem, Product } from "../shared/types";
import { groupProducts } from "../shared/lib/productGroup";

import React, { Component, ErrorInfo, ReactNode } from "react";

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; error: Error | null }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: "40px", color: "red", background: "#fff", zIndex: 9999, position: "relative" }}>
          <h1>Something went wrong.</h1>
          <pre>{this.state.error?.toString()}</pre>
          <pre>{this.state.error?.stack}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

export function ProductDetailPage() {
  return (
    <ErrorBoundary>
      <ProductDetailPageInner />
    </ErrorBoundary>
  );
}

function ProductDetailPageInner() {
  const { slug = "" } = useParams();
  const navigate = useNavigate();
  const { apiBase } = useSession();
  const { addItem } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [wasAdded, setWasAdded] = useState(false);
  const [recentlyAddedRelatedId, setRecentlyAddedRelatedId] = useState<string | null>(null);

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
        setLoadError("Não foi possível carregar este produto agora.");
      } finally {
        setIsLoading(false);
      }
    }

    void load();
  }, [apiBase]);

  const mergedProducts = useMemo(() => products.map((product) => ({
    ...product,
    availableStock: inventory.find((item) => item.sku === product.sku)?.availableStock ?? product.availableStock ?? 0
  })), [inventory, products]);

  const product = mergedProducts.find((item) => item.slug === slug);
  const productGroup = useMemo(() => {
    if (!product) return null;
    const allGroups = groupProducts(mergedProducts);
    return allGroups.find(g => g.products.some(p => p.id === product.id)) || null;
  }, [mergedProducts, product]);
  const relatedProducts = product
    ? mergedProducts
        .filter((item) => item.id !== product.id && getProductSectionSlugs(item).some((sectionSlug) => getProductSectionSlugs(product).includes(sectionSlug)))
        .slice(0, 4)
    : [];
  const groupedRelated = useMemo(() => groupProducts(relatedProducts), [relatedProducts]);
  useDocumentTitle(product?.name || "Produto");

  if (!isLoading && !loadError && !product) {
    return <Navigate to="/catalogo" replace />;
  }

  if (isLoading) {
    return (
      <div className="page-section product-detail-page">
        <ProductDetailSkeleton />
      </div>
    );
  }

  if (loadError || !product) {
    return (
      <div className="page-section product-detail-page">
        <div className="empty-state-panel">
          <strong>Produto indisponível</strong>
          <p>{loadError || "Não encontramos esse produto."}</p>
          <Link to="/catalogo" className="secondary-button compact">Voltar ao catálogo</Link>
        </div>
      </div>
    );
  }

  const imageUrl = getProductImageUrl(product);

  function addProductToCart() {
    if (!product) return;
    addItem(product);
    setWasAdded(true);
    window.setTimeout(() => setWasAdded(false), 1400);
  }

  function addRelatedToCart(related: Product) {
    addItem(related);
    setRecentlyAddedRelatedId(related.id);
    window.setTimeout(() => setRecentlyAddedRelatedId((current) => current === related.id ? null : current), 1400);
  }

  return (
    <div className="page-section product-detail-page">
      <Link to="/catalogo" className="back-link"><ArrowLeft size={16} /> Catálogo</Link>

      <section className="product-detail-hero">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%', maxWidth: '240px' }}>
          <div className="product-detail-media">
            <SafeImage
              src={imageUrl}
              alt={product.name}
              fallback={<ProductImageFallback name={product.name} />}
            />
          </div>
          
          {productGroup && productGroup.products.length > 1 && (
            <div className="product-variant-selector">
              <span style={{display: 'block', marginBottom: '12px', fontWeight: 600, fontSize: '0.85rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px'}}>Escolha um item:</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {productGroup.products.map((p) => {
                  const variantNameMatch = p.name.match(/\(([^)]+)\)/);
                  const variantName = variantNameMatch ? variantNameMatch[1] : p.name;
                  const isActive = p.slug === product.slug;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => navigate(`/produto/${p.slug}`)}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        textAlign: 'left',
                        padding: '12px',
                        borderRadius: '12px',
                        border: `1px solid ${isActive ? 'var(--accent)' : 'rgba(21, 21, 21, 0.08)'}`,
                        background: isActive ? 'rgba(255, 79, 31, 0.03)' : '#fff',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        boxShadow: isActive ? '0 4px 12px rgba(255, 79, 31, 0.1)' : '0 2px 4px rgba(0,0,0,0.02)'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%', marginBottom: '4px' }}>
                        <span style={{ fontWeight: 600, fontSize: '0.9rem', color: isActive ? 'var(--accent)' : '#111', lineHeight: '1.2' }}>{variantName}</span>
                        <strong style={{ fontSize: '0.9rem', color: isActive ? 'var(--accent)' : '#111', whiteSpace: 'nowrap', marginLeft: '8px' }}>
                          {formatCurrency(p.priceCents)}
                        </strong>
                      </div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
                        {(p.availableStock ?? 0) > 0 ? `(${p.availableStock} em estoque)` : '(Sem estoque)'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="product-detail-info">
          <span className="product-detail-kicker">{formatCategoryLabel(product)}{" \u2022 "}{formatDuration(product.durationDays)}</span>
          <h1>{product.name}</h1>
          <p>{product.description}</p>
          <div className="product-detail-availability" role="status">
            <CheckCircle2 size={17} />
            <span>{(product.availableStock ?? 0) > 0 ? "Disponível para entrega digital" : "Disponibilidade sob confirmação"}</span>
          </div>

          <strong className="product-detail-price">{formatCurrency(product.priceCents)}</strong>

          <div className="product-detail-actions">
            <button type="button" className="primary-button" onClick={addProductToCart}>
              <ShoppingBag size={18} /> {wasAdded ? "Adicionado" : "Comprar agora"}
            </button>
            <button
              type="button"
              className={wasAdded ? "product-add-button added" : "product-add-button"}
              onClick={addProductToCart}
            >
              {wasAdded ? "Adicionado" : "Adicionar ao carrinho"}
            </button>
          </div>
        </div>

        <div style={{ gridColumn: '1 / -1', marginTop: '8px', borderTop: '1px solid rgba(21, 21, 21, 0.06)', paddingTop: '24px' }}>
          <div style={{ padding: "16px", background: "rgba(255, 165, 0, 0.1)", borderRadius: "12px", border: "1px solid rgba(255, 165, 0, 0.3)", display: "flex", gap: "12px", alignItems: "flex-start", marginBottom: "16px" }}>
            <Info size={20} color="#e67e22" style={{ flexShrink: 0, marginTop: "2px" }} />
            <div>
              <strong style={{ display: "block", color: "#d35400", fontSize: "15px", marginBottom: "4px" }}>Entrega Manual: Em até 24 horas</strong>
              <p style={{ margin: 0, fontSize: "13.5px", color: "#a04000", lineHeight: "1.4" }}>
                Após a confirmação do pagamento via PIX, nossa equipe enviará os acessos no painel do seu pedido em até 24h. 
                <Link to="/termos" style={{ display: "inline-block", marginLeft: "4px", color: "#d35400", textDecoration: "underline", fontWeight: 500 }}>
                  Ver Políticas de Reembolso
                </Link>
              </p>
            </div>
          </div>

          <div className="trust-strip">
            <span><Zap size={16} /> Entrega digital</span>
            <span><ShieldCheck size={16} /> Pagamento PIX</span>
            <span><Headphones size={16} /> Suporte apos compra</span>
          </div>
        </div>
      </section>

      <section className="product-detail-grid">
        <article>
          <Clock3 size={19} />
          <h2>Detalhes</h2>
          <p>{product.fulfillmentNotes || "A entrega é feita digitalmente após confirmação do pagamento."}</p>
        </article>
        <article>
          <ShieldCheck size={19} />
          <h2>Como funciona</h2>
          <p>Adicione ao carrinho, finalize com PIX e acompanhe o status do pedido na sua conta.</p>
        </article>
        <article>
          <Zap size={19} />
          <h2>Entrega</h2>
          <p>Depois da aprovação, suas credenciais ficam vinculadas ao pedido para consulta posterior.</p>
        </article>
        <article>
          <Headphones size={19} />
          <h2>Suporte</h2>
          <p>Se algo não funcionar como esperado, o histórico do pedido ajuda a resolver com mais rapidez.</p>
        </article>
      </section>

      {groupedRelated.length > 0 ? (
        <section className="related-products">
          <div className="section-heading">
            <h2>Relacionados</h2>
          </div>
          <div className="catalog-grid">
            {groupedRelated.map((group) => (
              <ProductCard
                key={group.products[0].id}
                group={group}
                onAdd={addRelatedToCart}
                recentlyAddedProductId={recentlyAddedRelatedId}
              />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

function ProductDetailSkeleton() {
  return (
    <section className="product-detail-hero product-detail-skeleton" aria-label="Carregando produto">
      <div className="product-detail-media skeleton-block" />
      <div className="product-detail-info">
        <span className="skeleton-line short" />
        <span className="skeleton-line title" />
        <span className="skeleton-line" />
        <span className="skeleton-line medium" />
        <span className="skeleton-line price" />
        <div className="product-detail-actions">
          <span className="skeleton-button" />
          <span className="skeleton-button secondary" />
        </div>
      </div>
    </section>
  );
}

function ProductImageFallback({ name = "PR" }: { name?: string }) {
  return (
    <div className="product-image-fallback" aria-label={name}>
      <span>{name.slice(0, 2).toUpperCase()}</span>
    </div>
  );
}

function formatDuration(durationDays: number) {
  return durationDays === 0 ? "Vitalício" : `${durationDays} dias`;
}
