import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, Clock3, PackageCheck, RefreshCw } from "lucide-react";
import { apiClient } from "../shared/api/client";
import { formatCurrency, formatDate, labelStatus, statusTone } from "../shared/lib/format";
import { useSession } from "../shared/session/SessionContext";
import type { OrderDetail } from "../shared/types";

const STATUS_FILTERS = [
  { value: "ALL", label: "Todos" },
  { value: "PENDING", label: "Pendentes" },
  { value: "PAID", label: "Pagos" },
  { value: "DELIVERED", label: "Entregues" },
  { value: "ISSUES", label: "Com atencao" }
] as const;

type StatusFilter = typeof STATUS_FILTERS[number]["value"];

export function OrdersPage() {
  const { apiBase, token, user } = useSession();
  const [orders, setOrders] = useState<OrderDetail[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");

  const loadOrders = useCallback(async () => {
    if (!user) {
      setOrders([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError("");
    try {
      const summaries = await apiClient.getOrders(apiBase, token);
      const details = await Promise.all(summaries.map((summary) => apiClient.getOrder(summary.id, apiBase, token)));
      setOrders(details);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Nao foi possivel carregar seus pedidos.");
    } finally {
      setIsLoading(false);
    }
  }, [apiBase, token, user]);

  useEffect(() => {
    void loadOrders();
  }, [loadOrders]);

  const filteredOrders = useMemo(() => {
    if (statusFilter === "ALL") return orders;
    if (statusFilter === "ISSUES") return orders.filter((order) => ["CANCELED", "DELIVERY_FAILED"].includes(order.status));
    if (statusFilter === "PAID") return orders.filter((order) => ["PAID", "DELIVERY_PENDING"].includes(order.status));
    return orders.filter((order) => order.status === statusFilter);
  }, [orders, statusFilter]);

  const stats = useMemo(() => ({
    total: orders.length,
    pending: orders.filter((order) => order.status === "PENDING").length,
    delivered: orders.filter((order) => order.status === "DELIVERED").length,
    totalCents: orders.reduce((acc, order) => acc + order.totalCents, 0)
  }), [orders]);

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
    <div className="orders-page-grid">
      <section className="orders-overview">
        <div>
          <span className="eyebrow">pedidos</span>
          <h1>Meus pedidos</h1>
          <p>Acompanhe pagamentos, entregas e credenciais dos produtos comprados.</p>
        </div>
        <button type="button" className="secondary-button compact" onClick={() => void loadOrders()} disabled={isLoading}>
          <RefreshCw size={16} />
          {isLoading ? "Atualizando..." : "Atualizar"}
        </button>
      </section>

      <section className="orders-stats-grid">
        <div className="metric-panel">
          <Clock3 size={18} />
          <span>Pedidos</span>
          <strong>{stats.total}</strong>
        </div>
        <div className="metric-panel">
          <RefreshCw size={18} />
          <span>Pendentes</span>
          <strong>{stats.pending}</strong>
        </div>
        <div className="metric-panel">
          <PackageCheck size={18} />
          <span>Entregues</span>
          <strong>{stats.delivered}</strong>
        </div>
        <div className="metric-panel">
          <CheckCircle2 size={18} />
          <span>Total comprado</span>
          <strong>{formatCurrency(stats.totalCents)}</strong>
        </div>
      </section>

      <section className="panel-card panel-card-wide">
        <div className="orders-toolbar">
          <div className="category-switcher">
            {STATUS_FILTERS.map((filter) => (
              <button
                key={filter.value}
                type="button"
                className={filter.value === statusFilter ? "chip active" : "chip"}
                onClick={() => setStatusFilter(filter.value)}
              >
                {filter.label}
              </button>
            ))}
          </div>
          <span className="orders-count">{filteredOrders.length} de {orders.length}</span>
        </div>
        {error ? <div className="inline-error">{error}</div> : null}
        {isLoading ? <div className="empty-state-panel">Carregando pedidos...</div> : null}
        {!isLoading && orders.length === 0 ? (
          <div className="empty-state-panel">
            <strong>Nenhum pedido ainda</strong>
            <p>Seu historico vai aparecer aqui depois da primeira compra.</p>
            <Link to="/" className="primary-button compact">Ver catalogo</Link>
          </div>
        ) : null}
        {!isLoading && orders.length > 0 && filteredOrders.length === 0 ? (
          <div className="empty-state-panel">
            <strong>Nenhum pedido nesse filtro</strong>
            <p>Altere o filtro para ver outros status do seu historico.</p>
          </div>
        ) : null}
        <div className="orders-list">
          {filteredOrders.map((order) => (
            <article key={order.id} className="order-card-v2">
              <div className="order-card-head">
                <div>
                  <span className="muted-code">Pedido {shortId(order.id)}</span>
                  <strong>{orderTitle(order)}</strong>
                  <span>{orderSubtitle(order)}</span>
                </div>
                <span className={`status-pill ${statusTone(order.status)}`}>{labelStatus(order.status)}</span>
              </div>
              <div className="order-card-meta">
                <span>Total {formatCurrency(order.totalCents)}</span>
                <span>Criado em {formatDate(order.createdAt)}</span>
                <span>{statusContext(order)}</span>
              </div>
              <div className="order-card-footer">
                <span>{order.paymentMethod || "PIX"}</span>
                <Link to={`/pedidos/${order.id}`} className={order.status === "DELIVERED" ? "primary-button compact" : "secondary-button compact"}>
                  {order.status === "DELIVERED" ? "Ver entrega" : "Acompanhar pedido"}
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

function shortId(id: string) {
  return id.slice(0, 8);
}

function orderTitle(order: OrderDetail) {
  if (!order.items.length) return "Pedido sem itens";
  if (order.items.length === 1) return order.items[0].productName;
  return `${order.items[0].productName} +${order.items.length - 1}`;
}

function orderSubtitle(order: OrderDetail) {
  if (!order.items.length) return "Itens indisponiveis";
  return order.items.map((item) => `${item.quantity}x ${item.productName}`).join(", ");
}

function statusContext(order: OrderDetail) {
  if (order.status === "DELIVERED") return `Entregue em ${formatDate(order.deliveredAt)}`;
  if (order.status === "PAID" || order.status === "DELIVERY_PENDING") return "Pagamento aprovado";
  if (order.status === "CANCELED") return "Cancelado";
  if (order.status === "DELIVERY_FAILED") return "Precisa de suporte";
  return "Aguardando PIX";
}
