import { useEffect, useMemo, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { apiClient } from "../shared/api/client";
import { formatCurrency, formatDate, labelStatus, statusTone } from "../shared/lib/format";
import { useSession } from "../shared/session/SessionContext";
import type { DeliveredCredentialsResponse, OrderDetail } from "../shared/types";

interface PixState {
  copyPaste?: string;
  expiresAt?: string | null;
  externalReference?: string | null;
}

export function OrderDetailPage() {
  const { orderId = "" } = useParams();
  const location = useLocation();
  const { apiBase, token, user } = useSession();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [credentials, setCredentials] = useState<DeliveredCredentialsResponse | null>(null);
  const [pixState, setPixState] = useState<PixState>({
    copyPaste: (location.state as { pixCopyPaste?: string } | null)?.pixCopyPaste,
    expiresAt: (location.state as { pixExpiresAt?: string } | null)?.pixExpiresAt,
    externalReference: (location.state as { externalReference?: string } | null)?.externalReference
  });

  useEffect(() => {
    async function load() {
      const detail = await apiClient.getOrder(orderId, apiBase, token);
      setOrder(detail);
      setPixState((current) => ({
        ...current,
        externalReference: current.externalReference || detail.externalReference || undefined
      }));
      if (detail.status === "DELIVERED") {
        const delivered = await apiClient.getOrderCredentials(orderId, apiBase, token);
        setCredentials(delivered);
      }
    }
    if (user) {
      void load();
    }
  }, [apiBase, orderId, token, user]);

  const steps = useMemo(() => {
    const status = order?.status;
    return [
      { label: "Pedido criado", done: Boolean(order?.createdAt) },
      { label: "Pagamento aprovado", done: Boolean(order?.paidAt) || status === "PAID" || status === "DELIVERY_PENDING" || status === "DELIVERED" },
      { label: "Entrega em processamento", done: status === "DELIVERY_PENDING" || status === "DELIVERED" },
      { label: "Credenciais entregues", done: status === "DELIVERED" }
    ];
  }, [order]);

  const canSimulateLocalPayment = useMemo(() => {
    const isLocalApi = apiBase.includes("localhost") || apiBase.includes("127.0.0.1");
    return isLocalApi && Boolean(pixState.externalReference || order?.externalReference);
  }, [apiBase, order?.externalReference, pixState.externalReference]);

  async function simulatePayment() {
    const externalReference = pixState.externalReference || order?.externalReference;
    if (!externalReference) return;
    await apiClient.simulatePayment(externalReference, apiBase);
    const detail = await apiClient.getOrder(orderId, apiBase, token);
    setOrder(detail);
    if (detail.status === "DELIVERED") {
      const delivered = await apiClient.getOrderCredentials(orderId, apiBase, token);
      setCredentials(delivered);
    }
  }

  if (!user) {
    return (
      <div className="content-grid">
        <section className="panel-card">
          <span className="eyebrow">pedido</span>
          <h1>Entre para acompanhar este pedido</h1>
        </section>
      </div>
    );
  }

  return (
    <div className="order-detail-grid">
      <section className="panel-card">
        <span className="eyebrow">pedido</span>
        <div className="panel-header-inline">
          <h1>{order?.id || orderId}</h1>
          {order ? <span className={`status-pill ${statusTone(order.status)}`}>{labelStatus(order.status)}</span> : null}
        </div>
        <div className="detail-meta-list">
          <span>Total {order ? formatCurrency(order.totalCents) : "-"}</span>
          <span>Criado em {formatDate(order?.createdAt)}</span>
          <span>Metodo {order?.paymentMethod || "PIX"}</span>
        </div>
        <div className="timeline-list">
          {steps.map((step) => (
            <div key={step.label} className={step.done ? "timeline-step done" : "timeline-step"}>
              <span className="timeline-dot" />
              <span>{step.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="panel-card">
        <span className="eyebrow">pagamento</span>
        <h2>PIX atual</h2>
        {pixState.copyPaste ? (
          <div className="pix-card-v2">
            <code>{pixState.copyPaste}</code>
            <span>Expira em {formatDate(pixState.expiresAt)}</span>
            {canSimulateLocalPayment ? (
              <button type="button" className="secondary-button compact" onClick={() => void simulatePayment()}>
                Simular pagamento local
              </button>
            ) : null}
          </div>
        ) : (
          <div className="empty-state-panel">
            <strong>PIX nao capturado nesta sessao</strong>
            <p>Se o pedido foi criado aqui, ele aparecera no estado da tela. Depois podemos enriquecer isso via endpoint dedicado.</p>
          </div>
        )}
      </section>

      <section className="panel-card panel-card-wide">
        <span className="eyebrow">credenciais</span>
        <h2>Entrega</h2>
        {credentials?.credentials?.length ? (
          <div className="credentials-grid">
            {credentials.credentials.map((credential) => (
              <article key={credential.orderItemId} className="credential-card-v2">
                <strong>{credential.productName}</strong>
                <span>Login</span>
                <code>{credential.login}</code>
                <span>Senha</span>
                <code>{credential.password}</code>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-state-panel">
            <strong>Entrega ainda nao disponivel</strong>
            <p>Quando o pedido chegar a `ENTREGUE`, as credenciais aparecerao aqui.</p>
          </div>
        )}
      </section>
    </div>
  );
}
