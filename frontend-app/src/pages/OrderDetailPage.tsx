import { type Dispatch, type SetStateAction, useCallback, useEffect, useMemo, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { AlertTriangle, ArrowLeft, CheckCircle2, Copy, CreditCard, Eye, EyeOff, PackageCheck, RefreshCw, ShieldCheck } from "lucide-react";
import { apiClient } from "../shared/api/client";
import { getProductImageFromText } from "../shared/catalog/catalogData";
import { formatCurrency, formatDate, labelStatus, statusTone } from "../shared/lib/format";
import { useSession } from "../shared/session/SessionContext";
import type { DeliveredCredential, DeliveredCredentialSecretResponse, DeliveredCredentialsResponse, OrderDetail } from "../shared/types";

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
  const [credentialSecrets, setCredentialSecrets] = useState<Record<string, DeliveredCredentialSecretResponse>>({});
  const [copiedAction, setCopiedAction] = useState<string | null>(null);
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
        qrCode: detail.payment?.qrCode || current.qrCode || undefined,
        copyPaste: detail.payment?.copyPaste || current.copyPaste || undefined,
        expiresAt: detail.payment?.pixExpiresAt || current.expiresAt || undefined,
        externalReference: detail.externalReference || current.externalReference || undefined
      }));
      if (detail.status === "DELIVERED") {
        const delivered = await apiClient.getOrderCredentials(orderId, apiBase, token);
        setCredentials(delivered);
      } else {
        setCredentials(null);
        setCredentialSecrets({});
        setRevealedCredentials(new Set());
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
  const hasIssue = order?.status === "CANCELED" || order?.status === "DELIVERY_FAILED";
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

  async function loadCredentialSecret(orderItemId: string) {
    const cached = credentialSecrets[orderItemId];
    if (cached) {
      return cached;
    }
    const secret = await apiClient.revealOrderCredential(orderId, orderItemId, apiBase, token);
    setCredentialSecrets((current) => ({ ...current, [orderItemId]: secret }));
    return secret;
  }

  async function revealCredential(credential: DeliveredCredential) {
    if (revealedCredentials.has(credential.orderItemId)) {
      setRevealedCredentials((current) => {
        const next = new Set(current);
        next.delete(credential.orderItemId);
        return next;
      });
      return;
    }

    setError("");
    try {
      await loadCredentialSecret(credential.orderItemId);
      setRevealedCredentials((current) => new Set(current).add(credential.orderItemId));
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Nao foi possivel revelar a credencial.");
    }
  }

  async function copyCredentialValue(credential: DeliveredCredential, field: "login" | "password") {
    setError("");
    try {
      const secret = await loadCredentialSecret(credential.orderItemId);
      await navigator.clipboard.writeText(secret[field]);
      markCopied(`${credential.orderItemId}-${field}`, setCopiedAction);
    } catch {
      setError(`Nao foi possivel copiar ${field === "login" ? "o login" : "a senha"} automaticamente.`);
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
      <section className="panel-card order-detail-main-card">
        <div className="order-detail-topline">
          <Link to="/pedidos" className="back-link order-back-link"><ArrowLeft size={16} /> Pedidos</Link>
        </div>
        <div className="order-detail-title-row">
          <div>
            <h1>Pedido {shortOrderId(order?.id || orderId)}</h1>
            <span className="muted-code">{order?.id || orderId}</span>
          </div>
          {order ? <span className={`status-pill ${statusTone(order.status)}`}>{labelStatus(order.status)}</span> : null}
        </div>
        {order ? (
          <div className={`order-state-banner ${orderStateTone(order.status)}`}>
            {hasIssue ? <AlertTriangle size={20} /> : isDelivered ? <CheckCircle2 size={20} /> : <PackageCheck size={20} />}
            <div>
              <strong>{orderStateTitle(order.status)}</strong>
              <span>{orderStateDescription(order.status, order.failureReason)}</span>
            </div>
          </div>
        ) : null}
        <div className="order-action-row">
          <button type="button" className="secondary-button compact" onClick={() => void refreshNow()} disabled={isRefreshing || isLoading}>
            <RefreshCw size={15} />
            {isRefreshing ? "Atualizando..." : "Atualizar status"}
          </button>
          {shouldPoll ? <span className="live-refresh-indicator">Atualizacao automatica ativa</span> : null}
        </div>
        {error ? <div className="inline-error">{error}</div> : null}
        <div className="order-summary-grid">
          <article>
            <span>Total</span>
            <strong>{order ? formatCurrency(order.totalCents) : "-"}</strong>
          </article>
          <article>
            <span>Criado em</span>
            <strong>{formatDate(order?.createdAt)}</strong>
          </article>
          <article>
            <span>Metodo</span>
            <strong>{order?.paymentMethod || "PIX"}</strong>
          </article>
        </div>
        <div className="timeline-list">
          {steps.map((step) => (
            <div key={step.label} className={step.done ? "timeline-step done" : "timeline-step"}>
              <span className="timeline-dot" />
              <span>{step.label}</span>
            </div>
          ))}
        </div>
        {order?.items.length ? (
          <div className="order-items-summary">
            <span className="eyebrow">itens</span>
            {order.items.map((item) => (
              <div key={item.id} className="order-item-line">
                <div className="order-item-thumb">
                  {getProductImageFromText(item.productName) ? <img src={getProductImageFromText(item.productName) || ""} alt="" loading="lazy" /> : null}
                </div>
                <div>
                  <strong>{item.productName}</strong>
                  <span>{item.quantity} unidade(s)</span>
                </div>
                <span>{formatCurrency(item.totalPriceCents)}</span>
              </div>
            ))}
          </div>
        ) : null}
      </section>

      <section className={isDelivered ? "panel-card payment-card complete" : "panel-card payment-card"}>
        <div className="payment-card-head">
          <div className="payment-icon"><CreditCard size={20} /></div>
          <div>
            <span className="eyebrow">pagamento</span>
            <h2>{isDelivered ? "Pagamento aprovado" : "Pague com PIX"}</h2>
          </div>
        </div>
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
              {isQrImage(pixState.qrCode) ? (
                <img className="pix-qr-image" src={pixImageSrc(pixState.qrCode)} alt="QR Code PIX" />
              ) : null}
              <div className="pix-copy-panel">
                <span>Codigo copia e cola</span>
                <code>{pixState.copyPaste}</code>
              </div>
              <div className="pix-actions-row">
                <span>Expira em {formatDate(pixState.expiresAt)}</span>
                <button
                  type="button"
                  className={copiedAction === "pix" ? "primary-button compact copied" : "primary-button compact"}
                  onClick={() => void copyPix(pixState.copyPaste, setError, setCopiedAction)}
                >
                  <Copy size={15} />
                  {copiedAction === "pix" ? "Copiado" : "Copiar PIX"}
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
        <div className="delivery-section-head">
          <div className="payment-icon"><ShieldCheck size={20} /></div>
          <div>
            <span className="eyebrow">credenciais</span>
            <h2>Entrega</h2>
          </div>
        </div>
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
                    onClick={() => void revealCredential(credential)}
                    disabled={!credential.secretAvailable}
                  >
                    {revealedCredentials.has(credential.orderItemId) ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <span>Login</span>
                <div className="credential-copy-row">
                  <code>{credentialDisplayValue(credential, credentialSecrets[credential.orderItemId], revealedCredentials, "login")}</code>
                  <button type="button" className="icon-only-button credential-copy-button" aria-label="Copiar login" onClick={() => void copyCredentialValue(credential, "login")} disabled={!credential.secretAvailable}>
                    {copiedAction === `${credential.orderItemId}-login` ? <CheckCircle2 size={15} /> : <Copy size={15} />}
                  </button>
                </div>
                <span>Senha</span>
                <div className="credential-copy-row">
                  <code>{credentialDisplayValue(credential, credentialSecrets[credential.orderItemId], revealedCredentials, "password")}</code>
                  <button type="button" className="icon-only-button credential-copy-button" aria-label="Copiar senha" onClick={() => void copyCredentialValue(credential, "password")} disabled={!credential.secretAvailable}>
                    {copiedAction === `${credential.orderItemId}-password` ? <CheckCircle2 size={15} /> : <Copy size={15} />}
                  </button>
                </div>
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

function shortOrderId(id: string) {
  return id.slice(0, 8).toUpperCase();
}

function paymentHint(status?: string, canSimulateLocalPayment = false) {
  if (status === "DELIVERED") return "Pagamento confirmado e entrega concluida.";
  if (status === "PAID" || status === "DELIVERY_PENDING") return "Pagamento confirmado. A entrega sera atualizada automaticamente.";
  if (status === "CANCELED") return "Pedido cancelado. Este PIX nao deve mais ser pago.";
  if (status === "DELIVERY_FAILED") return "Pagamento identificado, mas a entrega precisa de revisao operacional.";
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

function orderStateTone(status: string) {
  if (status === "DELIVERED") return "success";
  if (status === "CANCELED" || status === "DELIVERY_FAILED") return "danger";
  if (status === "PAID" || status === "DELIVERY_PENDING") return "info";
  return "warning";
}

function orderStateTitle(status: string) {
  const map: Record<string, string> = {
    PENDING: "Aguardando pagamento PIX",
    PAID: "Pagamento aprovado",
    DELIVERY_PENDING: "Entrega em processamento",
    DELIVERED: "Credenciais liberadas",
    DELIVERY_FAILED: "Entrega precisa de suporte",
    CANCELED: "Pedido cancelado"
  };
  return map[status] || "Pedido em acompanhamento";
}

function orderStateDescription(status: string, failureReason?: string | null) {
  if (status === "PENDING") return "Pague usando o PIX desta tela. A confirmacao vem automaticamente pelo Mercado Pago.";
  if (status === "PAID") return "Recebemos a confirmacao e estamos preparando a entrega.";
  if (status === "DELIVERY_PENDING") return "A entrega foi colocada em processamento. Esta tela atualiza sozinha.";
  if (status === "DELIVERED") return "O pedido foi concluido. Revele e copie as credenciais abaixo quando precisar.";
  if (status === "DELIVERY_FAILED") return failureReason || "A entrega nao foi concluida automaticamente e precisa de acao operacional.";
  if (status === "CANCELED") return "Este pedido nao esta mais valido. Nao pague um PIX vencido ou cancelado.";
  return "Acompanhe o estado do pedido por aqui.";
}

function credentialDisplayValue(
  credential: DeliveredCredential,
  secret: DeliveredCredentialSecretResponse | undefined,
  revealedCredentials: Set<string>,
  field: "login" | "password"
) {
  if (!credential.secretAvailable) return "indisponivel";
  if (revealedCredentials.has(credential.orderItemId) && secret) {
    return secret[field];
  }
  if (field === "login") {
    return credential.loginHint || "********";
  }
  return "********";
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

async function copyPix(
  value: string | undefined,
  setError: Dispatch<SetStateAction<string>>,
  setCopiedAction: Dispatch<SetStateAction<string | null>>
) {
  if (!value) return;
  try {
    await navigator.clipboard.writeText(value);
    setError("");
    markCopied("pix", setCopiedAction);
  } catch {
    setError("Nao foi possivel copiar o PIX automaticamente.");
  }
}

function markCopied(action: string, setCopiedAction: Dispatch<SetStateAction<string | null>>) {
  setCopiedAction(action);
  window.setTimeout(() => setCopiedAction((current) => current === action ? null : current), 1600);
}
