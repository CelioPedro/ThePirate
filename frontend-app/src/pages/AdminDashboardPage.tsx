import { useEffect, useState } from "react";
import { apiClient } from "../shared/api/client";
import { formatCurrency, labelStatus, statusTone } from "../shared/lib/format";
import { useSession } from "../shared/session/SessionContext";
import type { InventoryItem, OrderDetail } from "../shared/types";

export function AdminDashboardPage() {
  const { apiBase, token } = useSession();
  const [orders, setOrders] = useState<OrderDetail[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);

  useEffect(() => {
    async function load() {
      const [ordersResponse, inventoryResponse] = await Promise.all([
        apiClient.getOrders(apiBase, token).catch(() => []),
        apiClient.getInventory(apiBase)
      ]);
      const detailResponses = await Promise.all(ordersResponse.map((summary) => apiClient.getOrder(summary.id, apiBase, token).catch(() => null)));
      setOrders(detailResponses.filter(Boolean) as OrderDetail[]);
      setInventory(inventoryResponse);
    }
    void load();
  }, [apiBase, token]);

  const metrics = [
    { label: "Pedidos", value: String(orders.length) },
    { label: "Receita", value: formatCurrency(orders.reduce((acc, order) => acc + order.totalCents, 0)) },
    { label: "Estoque total", value: String(inventory.reduce((acc, item) => acc + item.availableStock, 0)) },
    { label: "Criticos", value: String(inventory.filter((item) => item.availableStock <= 3).length) }
  ];

  return (
    <div className="admin-dashboard">
      <section className="admin-hero">
        <span className="eyebrow">operacao</span>
        <h1>Painel administrativo</h1>
        <p>Agora o fluxo operacional fica separado da experiencia de compra, com espaco para crescer sem confundir o cliente.</p>
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
          <span className="eyebrow">pedidos recentes</span>
          <div className="orders-list compact">
            {orders.slice(0, 6).map((order) => (
              <article key={order.id} className="order-card-v2 compact">
                <div className="order-card-head">
                  <strong>{order.id}</strong>
                  <span className={`status-pill ${statusTone(order.status)}`}>{labelStatus(order.status)}</span>
                </div>
                <span>{order.items.map((item) => item.productName).join(", ")}</span>
              </article>
            ))}
          </div>
        </div>

        <div className="panel-card">
          <span className="eyebrow">estoque</span>
          <div className="inventory-list">
            {inventory.slice(0, 8).map((item) => (
              <article key={item.sku} className="inventory-row">
                <div>
                  <strong>{item.name}</strong>
                  <span>{item.sku}</span>
                </div>
                <strong>{item.availableStock}</strong>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
