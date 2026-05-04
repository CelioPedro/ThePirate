import { type Dispatch, type SetStateAction, useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { CheckCircle2, Eye, EyeOff } from "lucide-react";
import { apiClient } from "../shared/api/client";
import { formatCurrency, formatDate, labelStatus, statusTone } from "../shared/lib/format";
import { useSession } from "../shared/session/SessionContext";
import type { DeliveredCredentialsResponse, OrderDetail } from "../shared/types";

interface PixState {
  qrCode?: string | null;
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
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [error, setError] = useState("");
  const [revealedCredentials, setRevealedCredentials] = useState<Set<string>>(new Set());
  const [pixState, setPixState] = useState<PixState>({
    qrCode: (location.state as { pixQrCode?: string | null } | null)?.pixQrCode,
    copyPaste: (location.state as { pixCopyPaste?: string } | null)?.pixCopyPaste,
    expiresAt: (location.state as { pixExpiresAt?: string } | null)?.pixExpiresAt,
    externalReference: (location.state as { externalReference?: string } | null)?.externalReference
  });

  const loadOrderState = useCallback(async (silent = false) => {
    if (!user) return;
    if (!silent) {
      setIsLoading(true);
    }
    setError("");

    try {
      const detail = await apiClient.getOrder(orderId, apiBase, token);
      setOrder(detail);
      setPixState((current) => ({
        ...current,
        qrCode: current.qrCode || detail.payment?.qrCode || undefined,
        copyPaste: current.copyPaste || detail.payment?.copyPaste || undefined,
        expiresAt: current.expiresAt || detail.payment?.pixExpiresAt || undefined,
        externalReference: current.externalReference || detail.externalReference || undefined
      }));
      if (detail.status === "DELIVERED") {
        const delivered = await apiClient.getOrderCredentials(orderId, apiBase, token);
        setCredentials(delivered);
      } else {
        setCredentials(null);
      }
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Nao foi possivel atualizar o pedido.");
    } finally {
      if (!silent) {
        setIsLoading(false);
      }
    }
  }, [apiBase, orderId, token, user]);

  useEffect(() => {
    if (user) {
      void loadOrderState();
    }
  }, [loadOrderState, user]);

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
    const isFakePix = Boolean(pixState.copyPaste?.includes("THEPIRATEMAX"));
    return isLocalApi && isFakePix && Boolean(pixState.externalReference || order?.externalReference);
  }, [apiBase, order?.externalReference, pixState.copyPaste, pixState.externalReference]);

  const isDelivered = order?.status === "DELIVERED";
  const shouldPoll = Boolean(order && ["PENDING", "PAID", "DELIVERY_PENDING"].includes(order.status));

  useEffect(() => {
    if (!shouldPoll) return;

    const intervalId = window.setInterval(() => {
      void loadOrderState(true);
    }, 3500);

    return () => window.clearInterval(intervalId);
  }, [loadOrderState, shouldPoll]);

  async function refreshNow() {
    setIsRefreshing(true);
    try {
      await loadOrderState(true);
    } finally {
      setIsRefreshing(false);
    }
  }

  async function simulatePayment() {
    const externalReference = pixState.externalReference || order?.externalReference;
    if (!externalReference) return;
    setIsSimulating(true);
    setError("");
    try {
      await apiClient.simulatePayment(externalReference, apiBase);
      await loadOrderState(true);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Nao foi possivel simular o pagamento.");
    } finally {
      setIsSimulating(false);
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
        <div className="order-action-row">
          <button type="button" className="secondary-button compact" onClick={() => void refreshNow()} disabled={isRefreshing || isLoading}>
            {isRefreshing ? "Atualizando..." : "Atualizar status"}
          </button>
          {shouldPoll ? <span className="live-refresh-indicator">Atualizacao automatica ativa</span> : null}
        </div>
        {error ? <div className="inline-error">{error}</div> : null}
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

      <section className={isDelivered ? "panel-card payment-card complete" : "panel-card payment-card"}>
        <span className="eyebrow">pagamento</span>
        <h2>{isDelivered ? "Pagamento aprovado" : "PIX atual"}</h2>
        {pixState.copyPaste ? (
          isDelivered ? (
            <div className="payment-complete-card">
              <div className="complete-icon">
                <CheckCircle2 size={22} />
              </div>
              <div>
                <strong>Pagamento confirmado via PIX</strong>
                <p className="helper-text">Entrega concluida. As credenciais deste pedido ja estao liberadas abaixo.</p>
              </div>
            </div>
          ) : (
            <div className="pix-card-v2">
              <code>{pixState.copyPaste}</code>
              {isQrImage(pixState.qrCode) ? (
                <img className="pix-qr-image" src={pixImageSrc(pixState.qrCode)} alt="QR Code PIX" />
              ) : null}
              <div className="pix-actions-row">
                <span>Expira em {formatDate(pixState.expiresAt)}</span>
                <button type="button" className="secondary-button compact" onClick={() => void copyPix(pixState.copyPaste, setError)}>
                  Copiar PIX
                </button>
              </div>
              {canSimulateLocalPayment ? (
                <button type="button" className="secondary-button compact" onClick={() => void simulatePayment()} disabled={isSimulating || order?.status === "DELIVERED"}>
                  {isSimulating ? "Simulando..." : "Simular pagamento local"}
                </button>
              ) : null}
              <p className="helper-text">{paymentHint(order?.status, canSimulateLocalPayment)}</p>
            </div>
          )
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
        {isDelivered ? (
          <div className="delivery-complete-banner">
            <CheckCircle2 size={20} />
            <div>
              <strong>Pedido entregue</strong>
              <span>Use o botao de olho para revelar login e senha apenas quando estiver pronto para copiar.</span>
            </div>
          </div>
        ) : null}
        {credentials?.credentials?.length ? (
          <div className="credentials-grid">
            {credentials.credentials.map((credential) => (
              <article key={credential.orderItemId} className="credential-card-v2">
                <div className="credential-card-head">
                  <strong>{credential.productName}</strong>
                  <button
                    type="button"
                    className="icon-only-button"
                    aria-label={revealedCredentials.has(credential.orderItemId) ? "Ocultar credencial" : "Revelar credencial"}
                    onClick={() => toggleCredentialReveal(credential.orderItemId, setRevealedCredentials)}
                  >
                    {revealedCredentials.has(credential.orderItemId) ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <span>Login</span>
                <code>{revealedCredentials.has(credential.orderItemId) ? credential.login : maskCredential(credential.login)}</code>
                <span>Senha</span>
                <code>{revealedCredentials.has(credential.orderItemId) ? credential.password : maskCredential(credential.password)}</code>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-state-panel">
            <strong>{order?.status === "DELIVERED" ? "Buscando credenciais" : "Entrega ainda nao disponivel"}</strong>
            <p>{deliveryHint(order?.status)}</p>
          </div>
        )}
      </section>
    </div>
  );
}

function paymentHint(status?: string, canSimulateLocalPayment = false) {
  if (status === "DELIVERED") return "Pagamento confirmado e entrega concluida.";
  if (status === "PAID" || status === "DELIVERY_PENDING") return "Pagamento confirmado. A entrega sera atualizada automaticamente.";
  if (status === "CANCELED") return "Pedido cancelado. Este PIX nao deve mais ser pago.";
  if (canSimulateLocalPayment) return "Aguardando pagamento PIX. Em ambiente local, use a simulacao para validar o fluxo.";
  return "Aguardando confirmacao do Mercado Pago. A tela sera atualizada automaticamente quando o webhook chegar.";
}

function deliveryHint(status?: string) {
  if (status === "DELIVERED") return "O pedido foi entregue. Se as credenciais nao aparecerem em instantes, use Atualizar status.";
  if (status === "PAID" || status === "DELIVERY_PENDING") return "Pagamento aprovado. Estamos acompanhando o processamento da entrega.";
  if (status === "CANCELED") return "Pedido cancelado antes da entrega.";
  if (status === "DELIVERY_FAILED") return "A entrega falhou e precisa de reprocessamento operacional.";
  return "Quando o pedido chegar a ENTREGUE, as credenciais aparecerao aqui.";
}

function maskCredential(value: string) {
  if (!value) return "********";
  return "*".repeat(Math.min(Math.max(value.length, 8), 18));
}

function toggleCredentialReveal(
  credentialId: string,
  setRevealedCredentials: Dispatch<SetStateAction<Set<string>>>
) {
  setRevealedCredentials((current) => {
    const next = new Set(current);
    if (next.has(credentialId)) {
      next.delete(credentialId);
    } else {
      next.add(credentialId);
    }
    return next;
  });
}

function isQrImage(value?: string | null) {
  if (!value) return false;
  return value.startsWith("data:image/") || !value.startsWith("000201");
}

function pixImageSrc(value?: string | null) {
  if (!value) return "";
  if (value.startsWith("data:image/")) return value;
  return `data:image/png;base64,${value}`;
}

async function copyPix(value: string | undefined, setError: Dispatch<SetStateAction<string>>) {
  if (!value) return;
  try {
    await navigator.clipboard.writeText(value);
    setError("");
  } catch {
    setError("Nao foi possivel copiar o PIX automaticamente.");
  }
}
