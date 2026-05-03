import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiClient } from "../api/client";
import { useCart } from "../cart/CartContext";
import { formatCurrency } from "../lib/format";
import { useSession } from "../session/SessionContext";

export function CartDrawer() {
  const navigate = useNavigate();
  const { items, isOpen, closeCart, removeItem, totalCents, clear } = useCart();
  const { apiBase, token, user, isDevFallback } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const grouped = useMemo(() => items, [items]);

  async function handleCheckout() {
    if (grouped.length === 0 || isSubmitting) return;
    setCheckoutError(null);
    if (!user) {
      navigate("/login");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await apiClient.createOrder({
        items: grouped.map((item) => ({ productId: item.id, quantity: 1 })),
        paymentMethod: "PIX"
      }, apiBase, token);
      clear();
      navigate(`/pedidos/${response.order.id}`, {
        state: {
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
          <button type="button" className="text-button" onClick={closeCart}>Fechar</button>
        </header>

        <div className="drawer-body">
          {grouped.length === 0 ? (
            <div className="empty-state-panel">
              <strong>Nenhum item selecionado</strong>
              <p>Adicione produtos do catalogo para gerar o pedido PIX.</p>
            </div>
          ) : (
            grouped.map((item) => (
              <article key={`${item.id}-${Math.random()}`} className="drawer-row">
                <div>
                  <strong>{item.name}</strong>
                  <span>{item.sku}</span>
                </div>
                <div className="drawer-row-actions">
                  <strong>{formatCurrency(item.priceCents)}</strong>
                  <button type="button" className="text-button" onClick={() => removeItem(item.id)}>Remover</button>
                </div>
              </article>
            ))
          )}
        </div>

        <footer className="drawer-footer">
          <div className="drawer-total">
            <span>Total</span>
            <strong>{formatCurrency(totalCents)}</strong>
          </div>
          {!user ? <p className="helper-text">Voce fara login antes de concluir o pedido.</p> : null}
          {checkoutError ? <p className="form-error">{checkoutError}</p> : null}
          <button type="button" className="primary-button" onClick={handleCheckout} disabled={grouped.length === 0 || isSubmitting}>
            {isSubmitting ? "Gerando pedido..." : "Finalizar compra"}
          </button>
        </footer>
      </aside>
    </>
  );
}
