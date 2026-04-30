import { useEffect, useState } from "react";
import { apiClient } from "../shared/api/client";
import { formatCurrency, formatDate, labelStatus, statusTone } from "../shared/lib/format";
import { useSession } from "../shared/session/SessionContext";
import type { AdminOrderDiagnostics, InventoryItem, OrderDetail } from "../shared/types";

export function AdminDashboardPage() {
  const { apiBase, token, user } = useSession();
  const [orders, setOrders] = useState<OrderDetail[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [diagnostics, setDiagnostics] = useState<AdminOrderDiagnostics | null>(null);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [isLoading, setIsLoading] = useState(true);
  const [isActing, setIsActing] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    void loadDashboard();
  }, [apiBase, token]);

  useEffect(() => {
    if (!selectedOrderId) {
      setDiagnostics(null);
      return;
    }
    void loadDiagnostics(selectedOrderId);
  }, [selectedOrderId]);

  async function loadDashboard() {
    setIsLoading(true);
    setMessage("");
    try {
      const [ordersResponse, inventoryResponse] = await Promise.all([
        apiClient.getOrders(apiBase, token).catch(() => []),
        apiClient.getInventory(apiBase)
      ]);
      const detailResponses = await Promise.all(ordersResponse.map((summary) => apiClient.getOrder(summary.id, apiBase, token).catch(() => null)));
      const details = detailResponses.filter(Boolean) as OrderDetail[];
      setOrders(details);
      setInventory(inventoryResponse);
      setSelectedOrderId((current) => current || details[0]?.id || null);
    } finally {
      setIsLoading(false);
    }
  }

  async function loadDiagnostics(orderId: string) {
    setMessage("");
    try {
      const response = await apiClient.getAdminOrderDiagnostics(orderId, apiBase, token);
      setDiagnostics(response);
    } catch (error) {
      setDiagnostics(null);
      setMessage(error instanceof Error ? error.message : "Nao foi possivel carregar o diagnostico.");
    }
  }

  async function runAdminAction(action: "reprocess" | "release") {
    if (!selectedOrderId) return;
    setIsActing(true);
    setMessage("");
    try {
      if (action === "reprocess") {
        await apiClient.reprocessAdminOrderDelivery(selectedOrderId, apiBase, token);
        setMessage("Reprocessamento solicitado com sucesso.");
      } else {
        await apiClient.releaseAdminOrderReservation(selectedOrderId, apiBase, token);
        setMessage("Reserva liberada com sucesso.");
      }
      await loadDashboard();
      await loadDiagnostics(selectedOrderId);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Nao foi possivel executar a acao.");
    } finally {
      setIsActing(false);
    }
  }

  const metrics = [
    { label: "Pedidos", value: String(orders.length) },
    { label: "Receita", value: formatCurrency(orders.reduce((acc, order) => acc + order.totalCents, 0)) },
    { label: "Estoque total", value: String(inventory.reduce((acc, item) => acc + item.availableStock, 0)) },
    { label: "Criticos", value: String(inventory.filter((item) => item.availableStock <= 3).length) }
  ];

  const filteredOrders = statusFilter === "ALL" ? orders : orders.filter((order) => order.status === statusFilter);
  const selectedOrder = orders.find((order) => order.id === selectedOrderId);

  if (user?.role !== "ADMIN") {
    return (
      <div className="admin-dashboard">
        <section className="panel-card">
          <span className="eyebrow">operacao</span>
          <h1>Acesso administrativo</h1>
          <p>Entre com uma conta admin para acessar diagnosticos, estoque operacional e acoes de reprocessamento.</p>
        </section>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <section className="admin-hero">
        <span className="eyebrow">operacao</span>
        <h1>Painel administrativo</h1>
        <p>Pedidos, estoque e diagnostico operacional em uma area separada da experiencia de compra.</p>
      </section>

      <section className="metrics-grid">
        {metrics.map((metric) => (
          <article key={metric.label} className="metric-panel">
            <span>{metric.label}</span>
            <strong>{metric.value}</strong>
          </article>
        ))}
      </section>

      <section className="admin-columns">
        <div className="panel-card">
          <div className="admin-section-head">
            <div>
              <span className="eyebrow">pedidos</span>
              <h2>Fila operacional</h2>
            </div>
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="admin-select">
              <option value="ALL">Todos</option>
              <option value="PENDING">Pendente</option>
              <option value="PAID">Pago</option>
              <option value="DELIVERY_PENDING">Em entrega</option>
              <option value="DELIVERED">Entregue</option>
              <option value="DELIVERY_FAILED">Falhou</option>
              <option value="CANCELED">Cancelado</option>
            </select>
          </div>
          <div className="orders-list compact">
            {isLoading ? <div className="empty-state-panel">Carregando pedidos...</div> : null}
            {!isLoading && filteredOrders.length === 0 ? <div className="empty-state-panel">Nenhum pedido nesse filtro.</div> : null}
            {filteredOrders.map((order) => (
              <button
                key={order.id}
                type="button"
                className={order.id === selectedOrderId ? "admin-order-row selected" : "admin-order-row"}
                onClick={() => setSelectedOrderId(order.id)}
              >
                <div className="order-card-head">
                  <strong>{order.id}</strong>
                  <span className={`status-pill ${statusTone(order.status)}`}>{labelStatus(order.status)}</span>
                </div>
                <span>{order.items.map((item) => item.productName).join(", ")}</span>
                <small>{formatCurrency(order.totalCents)} | {formatDate(order.createdAt)}</small>
              </button>
            ))}
          </div>
        </div>

        <div className="panel-card">
          <span className="eyebrow">diagnostico</span>
          <h2>{selectedOrder ? selectedOrder.id : "Selecione um pedido"}</h2>
          {message ? <div className="inline-banner">{message}</div> : null}
          {diagnostics ? (
            <div className="admin-diagnostics">
              <div className="diagnostic-grid">
                <div><span>Status</span><strong>{labelStatus(diagnostics.orderStatus)}</strong></div>
                <div><span>Total</span><strong>{formatCurrency(diagnostics.totalCents)}</strong></div>
                <div><span>Pagamento</span><strong>{diagnostics.payment?.providerStatus || "-"}</strong></div>
                <div><span>Falha</span><strong>{diagnostics.failureReason || "-"}</strong></div>
              </div>
              <div className="admin-action-row">
                <button type="button" className="secondary-button compact" disabled={isActing} onClick={() => void runAdminAction("reprocess")}>
                  Reprocessar entrega
                </button>
                <button type="button" className="secondary-button compact" disabled={isActing} onClick={() => void runAdminAction("release")}>
                  Liberar reserva
                </button>
              </div>
              <div className="diagnostic-items">
                {diagnostics.items.map((item) => (
                  <article key={item.orderItemId} className="diagnostic-item">
                    <strong>{item.productName}</strong>
                    <span>{item.productSku}</span>
                    <span>Credencial: {item.credentialStatus || "sem credencial"}</span>
                    <span>Lote: {item.sourceBatch || "-"}</span>
                  </article>
                ))}
              </div>
            </div>
          ) : (
            <div className="empty-state-panel">Diagnostico indisponivel para o pedido selecionado.</div>
          )}
        </div>
      </section>

      <section className="panel-card panel-card-wide">
        <div className="admin-section-head">
          <div>
            <span className="eyebrow">estoque</span>
            <h2>Inventario por produto</h2>
          </div>
          <button type="button" className="secondary-button compact" onClick={() => void loadDashboard()}>Atualizar</button>
        </div>
          <div className="inventory-list">
          {inventory.map((item) => (
              <article key={item.sku} className="inventory-row">
                <div>
                  <strong>{item.name}</strong>
                  <span>{item.sku}</span>
                </div>
                <strong>{item.availableStock}</strong>
              </article>
            ))}
          </div>
      </section>
    </div>
  );
}
