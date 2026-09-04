import { useState } from "react";
import { Link } from "react-router-dom";
import { getProductImageFallbackUrl, getProductImageUrl } from "../catalog/catalogData";
import { formatCurrency, humanizeCategory } from "../lib/format";
import type { Product } from "../types";
import type { ProductGroup } from "../lib/productGroup";

export function ProductCard({
  group,
  onAdd,
  recentlyAddedProductId
}: {
  group: ProductGroup;
  onAdd: (product: Product) => void;
  recentlyAddedProductId?: string | null;
}) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selectedProduct = group.products[selectedIndex];

  const imageUrl = getProductImageUrl(selectedProduct);
  const price = formatPriceParts(selectedProduct.priceCents);
  const isRecentlyAdded = recentlyAddedProductId === selectedProduct.id;

  return (
    <article className="product-card rail-product-card">
      <div className={`product-visual product-visual-${(selectedProduct.categorySlug || selectedProduct.category || "outros").toLowerCase()}`}>
        <Link to={`/produto/${selectedProduct.slug}`} className="product-visual-link" aria-label={`Ver ${selectedProduct.name}`}>
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={selectedProduct.name}
            loading="lazy"
            onError={(event) => {
              const fallbackImageUrl = getProductImageFallbackUrl(selectedProduct);
              if (fallbackImageUrl && event.currentTarget.src !== new URL(fallbackImageUrl, window.location.origin).href) {
                event.currentTarget.src = fallbackImageUrl;
                return;
              }
              event.currentTarget.style.display = "none";
            }}
          />
        ) : <ProductImageFallback product={selectedProduct} />}
        </Link>
      </div>
      <div className="product-body">
        <h3><Link to={`/produto/${selectedProduct.slug}`}>{group.baseName}</Link></h3>
        <p title={selectedProduct.description} style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {selectedProduct.description.split('\n')[0]}
        </p>
        

        <div className="product-price">
          <span>{price.currency}</span>
          <strong>{price.amount}</strong>
        </div>
        <div className="product-footer">
          <span className="product-card-meta">{formatCategoryChip(selectedProduct)}{" \u2022 "}{formatDuration(selectedProduct.durationDays)}</span>
          {group.products.length > 1 ? (
            <Link to={`/produto/${selectedProduct.slug}`} className="product-add-button" style={{ textDecoration: 'none', textAlign: 'center' }}>
              Ver opções
            </Link>
          ) : (
            <button
              type="button"
              className={isRecentlyAdded ? "product-add-button added" : "product-add-button"}
              onClick={() => onAdd(selectedProduct)}
            >
              {isRecentlyAdded ? "Adicionado" : "Adicionar"}
            </button>
          )}
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
  const label = formatCategoryChip(product) || "PR";
  return (
    <span className="product-image-fallback" aria-hidden="true">
      <span>{label.slice(0, 2).toUpperCase()}</span>
    </span>
  );
}
