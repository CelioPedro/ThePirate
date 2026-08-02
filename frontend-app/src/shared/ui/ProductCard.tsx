import { Link } from "react-router-dom";
import { getProductImageFallbackUrl, getProductImageUrl } from "../catalog/catalogData";
import { formatCurrency, humanizeCategory } from "../lib/format";
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

function formatDuration(durationDays: number) {
  return durationDays === 0 ? "Vitalício" : `${durationDays} dias`;
}

function ProductImageFallback({ product }: { product: Product }) {
  const label = formatCategoryChip(product);
  return (
    <span className="product-image-fallback" aria-hidden="true">
      <span>{label.slice(0, 2).toUpperCase()}</span>
    </span>
  );
}
