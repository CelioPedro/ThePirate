import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useParams, useSearchParams } from "react-router-dom";
import { Search } from "lucide-react";
import { apiClient } from "../shared/api/client";
import { getCategoryImageUrl, getProductImageUrl, getProductSectionSlugs, FALLBACK_CATEGORIES } from "../shared/catalog/catalogData";
import { formatCurrency } from "../shared/lib/format";
import { useSession } from "../shared/session/SessionContext";
import type { CatalogCategory, Product } from "../shared/types";

export function CategoryPage() {
  const { slug = "" } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const { apiBase } = useSession();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<CatalogCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const search = searchParams.get("busca") || "";

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        const [productsResponse, categoriesResponse] = await Promise.all([
          apiClient.getProducts(apiBase),
          apiClient.getCategories(apiBase).catch(() => FALLBACK_CATEGORIES)
        ]);
        setProducts(productsResponse);
        setCategories(categoriesResponse.length > 0 ? categoriesResponse : FALLBACK_CATEGORIES);
      } finally {
        setIsLoading(false);
      }
    }

    void load();
  }, [apiBase]);

  const category = (categories.length > 0 ? categories : FALLBACK_CATEGORIES).find((item) => item.slug === slug);
  const filteredProducts = useMemo(() => {
    const term = search.trim().toLowerCase();
    return products
      .filter((product) => getProductSectionSlugs(product).includes(slug))
      .filter((product) => !term || `${product.name} ${product.description} ${product.provider}`.toLowerCase().includes(term));
  }, [products, search, slug]);

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
        {category && getCategoryImageUrl(category) ? <img src={getCategoryImageUrl(category) || ""} alt="" /> : null}
      </section>

      <label className="catalog-search-field category-search">
        <Search size={18} />
        <input
          className="toolbar-search"
          value={search}
          onChange={(event) => setSearchParams(event.target.value ? { busca: event.target.value } : {})}
          placeholder="Buscar nesta categoria"
          aria-label="Buscar nesta categoria"
        />
      </label>

      {isLoading ? (
        <CategorySkeletonGrid />
      ) : null}
      {!isLoading && filteredProducts.length === 0 ? (
        <div className="empty-state-panel">
          <strong>Nenhum produto nesta categoria</strong>
          <p>Novos itens podem entrar em breve. Enquanto isso, explore outras categorias do catalogo.</p>
          <Link to="/catalogo" className="secondary-button compact">Ver catalogo completo</Link>
        </div>
      ) : null}

      <section className="category-product-grid">
        {filteredProducts.map((product) => (
          <Link key={product.id} to={`/produto/${product.slug}`} className="category-product-card">
            {getProductImageUrl(product) ? <img src={getProductImageUrl(product) || ""} alt="" /> : <span className="product-image-fallback small">{product.name.slice(0, 2).toUpperCase()}</span>}
            <strong>{product.name}</strong>
            <span>{formatCurrency(product.priceCents)}</span>
          </Link>
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
