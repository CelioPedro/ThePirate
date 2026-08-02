import { Link } from "react-router-dom";
import { formatCategoryChip, formatDuration, getProductImageFallbackUrl, getProductImageUrl } from "../catalog/catalogData";
import { formatPriceParts } from "../lib/format";
import type { Product } from "../types";

export function ProductCard({
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
