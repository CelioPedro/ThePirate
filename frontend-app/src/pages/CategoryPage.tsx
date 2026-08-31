import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useParams, useSearchParams } from "react-router-dom";
import { apiClient } from "../shared/api/client";
import { getCategoryImageUrl, getProductSectionSlugs, FALLBACK_CATEGORIES } from "../shared/catalog/catalogData";
import { useDocumentTitle } from "../shared/lib/useDocumentTitle";
import { useSession } from "../shared/session/SessionContext";
import { useCart } from "../shared/cart/CartContext";
import { SafeImage } from "../shared/ui/SafeImage";
import { ProductCard } from "../shared/ui/ProductCard";
import type { CatalogCategory, Product } from "../shared/types";
import { groupProducts } from "../shared/lib/productGroup";

export function CategoryPage() {
  const { slug = "" } = useParams();
  const { apiBase } = useSession();
  const { addItem } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<CatalogCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [recentlyAddedProductId, setRecentlyAddedProductId] = useState<string | null>(null);

  function addProductToCart(product: Product) {
    addItem(product);
    setRecentlyAddedProductId(product.id);
    window.setTimeout(() => setRecentlyAddedProductId((current) => current === product.id ? null : current), 1400);
  }

  async function loadCategory() {
    setIsLoading(true);
    setLoadError("");
    try {
      const [productsResponse, categoriesResponse] = await Promise.all([
        apiClient.getProducts(apiBase),
        apiClient.getCategories(apiBase).catch(() => FALLBACK_CATEGORIES)
      ]);
      setProducts(productsResponse);
      setCategories(categoriesResponse.length > 0 ? categoriesResponse : FALLBACK_CATEGORIES);
    } catch {
      setProducts([]);
      setCategories(FALLBACK_CATEGORIES);
      setLoadError("Nao foi possivel carregar esta categoria agora.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadCategory();
  }, [apiBase]);

  const category = (categories.length > 0 ? categories : FALLBACK_CATEGORIES).find((item) => item.slug === slug);
  const productGroups = useMemo(() => {
    return groupProducts(products.filter((product) => getProductSectionSlugs(product).includes(slug)));
  }, [products, slug]);

  useDocumentTitle(category?.name || "Categoria");

  if (!isLoading && !category) {
    return <Navigate to="/catalogo" replace />;
  }

  return (
    <div className="page-section category-page">
      <section className="category-hero">
        <div>
          <span className="eyebrow">categoria</span>
          <h1>{category?.name || "Categoria"}</h1>
          <p>{category?.description || "Produtos digitais selecionados."}</p>
        </div>
        {category ? (
          <SafeImage
            src={getCategoryImageUrl(category)}
            alt=""
            fallback={null}
          />
        ) : null}
      </section>

      {isLoading ? (
        <CategorySkeletonGrid />
      ) : null}
      {!isLoading && loadError ? (
        <div className="empty-state-panel">
          <strong>Categoria indisponivel</strong>
          <p>{loadError}</p>
          <button type="button" className="secondary-button compact" onClick={() => void loadCategory()}>Tentar novamente</button>
        </div>
      ) : null}
      {!isLoading && !loadError && productGroups.length === 0 ? (
        <div className="empty-state-panel">
          <strong>Nenhum produto nesta categoria</strong>
          <p>Novos itens podem entrar em breve. Enquanto isso, explore outras categorias do catalogo.</p>
          <Link to="/catalogo" className="secondary-button compact">Ver catalogo completo</Link>
        </div>
      ) : null}

      <section className="catalog-grid">
        {productGroups.map((group) => (
          <ProductCard
            key={group.products[0].id}
            group={group}
            onAdd={addProductToCart}
            recentlyAddedProductId={recentlyAddedProductId}
          />
        ))}
      </section>
    </div>
  );
}

function CategorySkeletonGrid() {
  return (
    <section className="category-product-grid" aria-label="Carregando produtos">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="category-product-card skeleton-category-card">
          <span className="skeleton-media" />
          <span className="skeleton-line medium" />
          <span className="skeleton-line short" />
        </div>
      ))}
    </section>
  );
}
