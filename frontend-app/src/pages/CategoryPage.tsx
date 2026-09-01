import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useParams, useSearchParams } from "react-router-dom";
import { apiClient } from "../shared/api/client";
import { getCategoryImageUrl, getProductSectionSlugs, FALLBACK_CATEGORIES } from "../shared/catalog/catalogData";
import { useDocumentTitle } from "../shared/lib/useDocumentTitle";
import { useSession } from "../shared/session/SessionContext";
import { useCart } from "../shared/cart/CartContext";
import { SafeImage } from "../shared/ui/SafeImage";
import { ProductCard } from "../shared/ui/ProductCard";
import { ScrollableRail } from "../shared/ui/ScrollableRail";
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
      const [productsRes, categoriesRes] = await Promise.all([
        apiClient.getProducts(apiBase),
        apiClient.getCategories(apiBase).catch(() => FALLBACK_CATEGORIES)
      ]);
      setProducts(productsRes);
      setCategories(categoriesRes.length > 0 ? categoriesRes : FALLBACK_CATEGORIES);
    } catch (err) {
      console.error("Failed to load category data:", err);
      setProducts([]);
      setCategories(FALLBACK_CATEGORIES);
      setLoadError("Nao foi possivel carregar os dados. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadCategory();
  }, [apiBase]);

  const category = categories.find((c) => c.slug === slug) || FALLBACK_CATEGORIES.find((c) => c.slug === slug);
  useDocumentTitle(category ? `${category.name} - The Pirate` : "Categoria");

  const productGroups = useMemo(() => {
    if (!category) return [];
    const categoryProducts = products.filter((p) => {
      const slugs = getProductSectionSlugs(p);
      return slugs.includes(category.slug);
    });
    return groupProducts(categoryProducts);
  }, [products, category]);

  if (!isLoading && !category) {
    return <Navigate to="/catalogo" replace />;
  }

  const categoryTitle = category?.name || "Carregando...";
  const categoryDescription = category?.description || "Explore nossa colecao de produtos nesta categoria.";

  return (
    <div className="page-section category-page">
      <div className="category-header">
        <div className="category-header-info">
          <span className="category-header-kicker">CATEGORIA</span>
          <h1>{categoryTitle}</h1>
          <p>{categoryDescription}</p>
        </div>
        {category && (
          <div className="category-header-media">
            <SafeImage
              src={getCategoryImageUrl(category)}
              alt={categoryTitle}
              className="category-header-image"
              fallback={null}
            />
          </div>
        )}
      </div>

      {loadError ? (
        <div className="error-panel">
          <p>{loadError}</p>
          <button type="button" onClick={() => void loadCategory()} className="secondary-button compact">
            Tentar novamente
          </button>
        </div>
      ) : null}

      {isLoading ? (
        <CategorySkeletonGrid />
      ) : null}

      {!isLoading && !loadError && productGroups.length === 0 ? (
        <div className="empty-state-panel">
          <strong>Nenhum produto nesta categoria</strong>
          <p>Novos itens podem entrar em breve. Enquanto isso, explore outras categorias do catalogo.</p>
          <Link to="/catalogo" className="secondary-button compact">Ver catalogo completo</Link>
        </div>
      ) : null}

      <ScrollableRail className="product-rail" label={`Produtos da categoria ${categoryTitle}`}>
        {productGroups.map((group) => (
          <ProductCard
            key={group.products[0].id}
            group={group}
            onAdd={addProductToCart}
            recentlyAddedProductId={recentlyAddedProductId}
          />
        ))}
      </ScrollableRail>
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
