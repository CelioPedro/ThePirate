import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Minus, Plus, X } from "lucide-react";
import { apiClient } from "../api/client";
import { useCart } from "../cart/CartContext";
import { getProductImageUrl } from "../catalog/catalogData";
import { formatCurrency } from "../lib/format";
import { useSession } from "../session/SessionContext";
import type { Product } from "../types";

interface CartLine {
  product: Product;
  quantity: number;
  subtotalCents: number;
}

export function CartDrawer() {
  const navigate = useNavigate();
  const { items, isOpen, closeCart, addItem, decrementItem, removeItem, totalCents, clear } = useCart();
  const { apiBase, token, user, isDevFallback } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [checkoutIdempotencyKey, setCheckoutIdempotencyKey] = useState<string | null>(null);

  const grouped = useMemo(() => groupCartItems(items), [items]);
  const latestItem = items.length > 0 ? items[items.length - 1] : null;
  const latestItemId = latestItem?.id || null;

  async function handleCheckout() {
    if (grouped.length === 0 || isSubmitting) return;
    setCheckoutError(null);
    if (!user) {
      navigate("/login");
      return;
    }

    setIsSubmitting(true);
    const idempotencyKey = checkoutIdempotencyKey || createCheckoutIdempotencyKey();
    setCheckoutIdempotencyKey(idempotencyKey);
    try {
      const response = await apiClient.createOrder({
        items: grouped.map((line) => ({ productId: line.product.id, quantity: line.quantity })),
        paymentMethod: "PIX",
        idempotencyKey
      }, apiBase, token);
      clear();
      setCheckoutIdempotencyKey(null);
      navigate(`/pedidos/${response.order.id}`, {
        state: {
          pixQrCode: response.payment.qrCode,
          pixCopyPaste: response.payment.copyPaste,
          pixExpiresAt: response.payment.expiresAt,
          externalReference: response.order.externalReference,
          fromDevSession: isDevFallback
        }
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Nao foi possivel finalizar a compra agora.";
      setCheckoutError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <div className={`drawer-backdrop ${isOpen ? "visible" : ""}`} onClick={closeCart} />
      <aside className={`cart-drawer ${isOpen ? "open" : ""}`} aria-label="Carrinho">
        <header className="drawer-header">
          <div>
            <span className="eyebrow">checkout</span>
            <h3>Seu carrinho</h3>
          </div>
          <button type="button" className="cart-close-button" onClick={closeCart} aria-label="Fechar carrinho">
            <X size={24} />
          </button>
        </header>

        <div className="drawer-body">
          {grouped.length === 0 ? (
            <div className="empty-state-panel">
              <strong>Nenhum item selecionado</strong>
              <p>Adicione produtos do catalogo para gerar o pedido PIX.</p>
            </div>
          ) : (
            grouped.map((line) => (
              <article
                key={line.product.id}
                className={line.product.id === latestItemId ? "drawer-row newly-added" : "drawer-row"}
              >
                <div className="drawer-item-thumb">
                  {getProductImageUrl(line.product) ? <img src={getProductImageUrl(line.product) || ""} alt="" loading="lazy" /> : null}
                </div>
                <div className="drawer-item-copy">
                  <strong>{formatCartProductName(line.product.name)}</strong>
                  <span>{line.product.provider}</span>
                  <div className="cart-quantity-stepper" aria-label={`Quantidade de ${line.product.name}`}>
                    <button type="button" onClick={() => decrementItem(line.product.id)} aria-label="Diminuir quantidade">
                      <Minus size={14} />
                    </button>
                    <span>{line.quantity}</span>
                    <button type="button" onClick={() => addItem(line.product)} aria-label="Aumentar quantidade">
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
                <div className="drawer-row-actions">
                  <strong>{formatCurrency(line.subtotalCents)}</strong>
                  <span>{line.quantity} x {formatCurrency(line.product.priceCents)}</span>
                  <button type="button" className="text-button" onClick={() => removeItem(line.product.id)}>Remover</button>
                </div>
              </article>
            ))
          )}
        </div>

        <footer className="drawer-footer">
          <div className="checkout-step-strip" aria-label="Etapas do checkout">
            <span className={grouped.length > 0 ? "active" : ""}>Carrinho</span>
            <span className={user ? "active" : ""}>Conta</span>
            <span>PIX</span>
            <span>Entrega</span>
          </div>
          <div className="drawer-total">
            <span>Total</span>
            <strong>{formatCurrency(totalCents)}</strong>
          </div>
          {!user ? <p className="helper-text">Voce fara login antes de concluir o pedido.</p> : <p className="helper-text">O PIX sera gerado na proxima etapa e o pedido ficara salvo na sua conta.</p>}
          {checkoutError ? <p className="form-error">{checkoutError}</p> : null}
          <button type="button" className="primary-button" onClick={handleCheckout} disabled={grouped.length === 0 || isSubmitting}>
            {isSubmitting ? "Gerando pedido..." : "Finalizar compra"}
          </button>
        </footer>
      </aside>
    </>
  );
}

function groupCartItems(items: Product[]): CartLine[] {
  const lines = new Map<string, CartLine>();
  items.forEach((item) => {
    const current = lines.get(item.id);
    if (!current) {
      lines.set(item.id, {
        product: item,
        quantity: 1,
        subtotalCents: item.priceCents
      });
      return;
    }
    current.quantity += 1;
    current.subtotalCents += item.priceCents;
  });
  return Array.from(lines.values());
}

function formatCartProductName(name: string) {
  return name.replace(/\s*TPM-[A-Z0-9-]+$/i, "").trim();
}

function createCheckoutIdempotencyKey() {
  if (crypto.randomUUID) {
    return `checkout-${crypto.randomUUID()}`;
  }
  return `checkout-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
