import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Clock3, Headphones, ShieldCheck, ShoppingBag, Zap } from "lucide-react";
import { apiClient } from "../shared/api/client";
import { useCart } from "../shared/cart/CartContext";
import { formatCategoryLabel, getProductImageUrl, getProductSectionSlugs } from "../shared/catalog/catalogData";
import { formatCurrency } from "../shared/lib/format";
import { useSession } from "../shared/session/SessionContext";
import type { InventoryItem, Product } from "../shared/types";

export function ProductDetailPage() {
  const { slug = "" } = useParams();
  const { apiBase } = useSession();
  const { addItem } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [wasAdded, setWasAdded] = useState(false);

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
        setLoadError("Nao foi possivel carregar este produto agora.");
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
  const relatedProducts = product
    ? mergedProducts
        .filter((item) => item.id !== product.id && getProductSectionSlugs(item).some((sectionSlug) => getProductSectionSlugs(product).includes(sectionSlug)))
        .slice(0, 4)
    : [];

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
          <strong>Produto indisponivel</strong>
          <p>{loadError || "Nao encontramos esse produto."}</p>
          <Link to="/catalogo" className="secondary-button compact">Voltar ao catalogo</Link>
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

  return (
    <div className="page-section product-detail-page">
      <Link to="/catalogo" className="back-link"><ArrowLeft size={16} /> Catalogo</Link>

      <section className="product-detail-hero">
        <div className="product-detail-media">
          {imageUrl ? <img src={imageUrl} alt={product.name} /> : <ProductImageFallback name={product.name} />}
        </div>
        <div className="product-detail-info">
          <span className="product-detail-kicker">{formatCategoryLabel(product)}{" \u2022 "}{formatDuration(product.durationDays)}</span>
          <h1>{product.name}</h1>
          <p>{product.description}</p>
          <div className="product-detail-availability" role="status">
            <CheckCircle2 size={17} />
            <span>{(product.availableStock ?? 0) > 0 ? "Disponivel para entrega digital" : "Disponibilidade sob confirmacao"}</span>
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
          <p>{product.fulfillmentNotes || "A entrega e feita digitalmente apos confirmacao do pagamento."}</p>
        </article>
        <article>
          <ShieldCheck size={19} />
          <h2>Como funciona</h2>
          <p>Adicione ao carrinho, finalize com PIX e acompanhe o status do pedido na sua conta.</p>
        </article>
        <article>
          <Zap size={19} />
          <h2>Entrega</h2>
          <p>Depois da aprovacao, suas credenciais ficam vinculadas ao pedido para consulta posterior.</p>
        </article>
        <article>
          <Headphones size={19} />
          <h2>Suporte</h2>
          <p>Se algo nao funcionar como esperado, o historico do pedido ajuda a resolver com mais rapidez.</p>
        </article>
      </section>

      {relatedProducts.length > 0 ? (
        <section className="related-products">
          <div className="section-heading">
            <h2>Relacionados</h2>
          </div>
          <div className="related-product-grid">
            {relatedProducts.map((related) => (
              <Link key={related.id} to={`/produto/${related.slug}`} className="related-product-card">
                {getProductImageUrl(related) ? <img src={getProductImageUrl(related) || ""} alt="" /> : null}
                <strong>{related.name}</strong>
                <span>{formatCurrency(related.priceCents)}</span>
              </Link>
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

function ProductImageFallback({ name }: { name: string }) {
  return (
    <div className="product-image-fallback" aria-label={name}>
      <span>{name.slice(0, 2).toUpperCase()}</span>
    </div>
  );
}

function formatDuration(durationDays: number) {
  return durationDays === 0 ? "Vitalicio" : `${durationDays} dias`;
}
