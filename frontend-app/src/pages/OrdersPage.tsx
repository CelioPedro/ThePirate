import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiClient } from "../shared/api/client";
import { formatCurrency, formatDate, labelStatus, statusTone } from "../shared/lib/format";
import { useSession } from "../shared/session/SessionContext";
import type { OrderDetail } from "../shared/types";

export function OrdersPage() {
  const { apiBase, token, user } = useSession();
  const [orders, setOrders] = useState<OrderDetail[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!user) {
        setOrders([]);
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const summaries = await apiClient.getOrders(apiBase, token);
        const details = await Promise.all(summaries.map((summary) => apiClient.getOrder(summary.id, apiBase, token)));
        setOrders(details);
      } finally {
        setIsLoading(false);
      }
    }

    void load();
  }, [apiBase, token, user]);

  if (!user) {
    return (
      <div className="content-grid">
        <section className="panel-card">
          <span className="eyebrow">pedidos</span>
          <h1>Entre para ver seus pedidos</h1>
          <p>A area de pos-compra agora vive separada do catalogo, com foco em rastreabilidade e entrega.</p>
          <Link to="/login" className="primary-button compact">Ir para login</Link>
        </section>
      </div>
    );
  }

  return (
    <div className="content-grid">
      <section className="panel-card panel-card-wide">
        <span className="eyebrow">pedidos</span>
        <h1>Meus pedidos</h1>
        {isLoading ? <div className="empty-state-panel">Carregando pedidos...</div> : null}
        {!isLoading && orders.length === 0 ? (
          <div className="empty-state-panel">
            <strong>Nenhum pedido ainda</strong>
            <p>Seu historico vai aparecer aqui depois da primeira compra.</p>
          </div>
        ) : null}
        <div className="orders-list">
          {orders.map((order) => (
            <article key={order.id} className="order-card-v2">
              <div className="order-card-head">
                <div>
                  <strong>{order.id}</strong>
                  <span>{order.items.map((item) => item.productName).join(", ")}</span>
                </div>
                <span className={`status-pill ${statusTone(order.status)}`}>{labelStatus(order.status)}</span>
              </div>
              <div className="order-card-meta">
                <span>Total {formatCurrency(order.totalCents)}</span>
                <span>Criado em {formatDate(order.createdAt)}</span>
              </div>
              <Link to={`/pedidos/${order.id}`} className="secondary-button compact">Abrir pedido</Link>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
