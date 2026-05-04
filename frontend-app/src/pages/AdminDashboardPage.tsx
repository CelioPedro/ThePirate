import { useEffect, useState } from "react";
import { apiClient } from "../shared/api/client";
import { formatCurrency, formatDate, humanizeCategory, labelStatus, statusTone } from "../shared/lib/format";
import { useSession } from "../shared/session/SessionContext";
import type { AdminCredentialResponse, AdminOrderDiagnostics, AdminProduct, InventoryItem, OrderDetail, Product } from "../shared/types";

const EMPTY_CREDENTIAL_FORM = {
  productId: "",
  login: "",
  password: "",
  sourceBatch: "manual-admin"
};

const EMPTY_PRODUCT_FORM = {
  id: "",
  sku: "",
  slug: "",
  name: "",
  description: "",
  category: "STREAMING",
  provider: "",
  priceReais: "0,00",
  status: "ACTIVE" as AdminProduct["status"],
  durationDays: 30,
  fulfillmentNotes: ""
};

export function AdminDashboardPage() {
  const { apiBase, token, user } = useSession();
  const [orders, setOrders] = useState<OrderDetail[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [adminProducts, setAdminProducts] = useState<AdminProduct[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [credentials, setCredentials] = useState<AdminCredentialResponse[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [diagnostics, setDiagnostics] = useState<AdminOrderDiagnostics | null>(null);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [credentialProductFilter, setCredentialProductFilter] = useState("");
  const [credentialStatusFilter, setCredentialStatusFilter] = useState("AVAILABLE");
  const [isLoading, setIsLoading] = useState(true);
  const [isActing, setIsActing] = useState(false);
  const [isLoadingCredentials, setIsLoadingCredentials] = useState(false);
  const [isSavingProduct, setIsSavingProduct] = useState(false);
  const [isCreatingCredential, setIsCreatingCredential] = useState(false);
  const [credentialForm, setCredentialForm] = useState(EMPTY_CREDENTIAL_FORM);
  const [productForm, setProductForm] = useState(EMPTY_PRODUCT_FORM);
  const [isCreatingProductMode, setIsCreatingProductMode] = useState(false);
  const [diagnosticsMessage, setDiagnosticsMessage] = useState("");
  const [stockMessage, setStockMessage] = useState("");
  const [productMessage, setProductMessage] = useState("");

  useEffect(() => {
    void loadDashboard();
  }, [apiBase, token]);

  useEffect(() => {
    if (user?.role === "ADMIN") {
      void loadCredentials();
    }
  }, [apiBase, token, user?.role, credentialProductFilter, credentialStatusFilter]);

  useEffect(() => {
    if (!selectedOrderId) {
      setDiagnostics(null);
      return;
    }
    void loadDiagnostics(selectedOrderId);
  }, [selectedOrderId]);

  async function loadDashboard() {
    setIsLoading(true);
    setDiagnosticsMessage("");
    try {
      const [ordersResponse, inventoryResponse, productsResponse] = await Promise.all([
        apiClient.getOrders(apiBase, token).catch(() => []),
        apiClient.getInventory(apiBase),
        apiClient.getProducts(apiBase)
      ]);
      const detailResponses = await Promise.all(ordersResponse.map((summary) => apiClient.getOrder(summary.id, apiBase, token).catch(() => null)));
      const details = detailResponses.filter(Boolean) as OrderDetail[];
      setOrders(details);
      setInventory(inventoryResponse);
      setProducts(productsResponse);
      setCredentialForm((current) => ({
        ...current,
        productId: current.productId || productsResponse[0]?.id || ""
      }));
      setCredentialProductFilter((current) => current || productsResponse[0]?.id || "");
      setSelectedOrderId((current) => {
        if (current && details.some((order) => order.id === current)) {
          return current;
        }
        return details[0]?.id || null;
      });
      await loadAdminProducts();
    } finally {
      setIsLoading(false);
    }
  }

  async function loadAdminProducts() {
    try {
      const response = await apiClient.getAdminProducts(apiBase, token);
      setAdminProducts(response);
      setProductForm((current) => {
        if (current.id && response.some((product) => product.id === current.id)) {
          return current;
        }
        return toProductForm(response[0]);
      });
    } catch {
      setAdminProducts([]);
    }
  }

  async function loadCredentials() {
    setIsLoadingCredentials(true);
    try {
      const response = await apiClient.getAdminCredentials({
        productId: credentialProductFilter || undefined,
        status: credentialStatusFilter || undefined
      }, apiBase, token);
      setCredentials(response);
    } catch {
      setCredentials([]);
    } finally {
      setIsLoadingCredentials(false);
    }
  }

  async function loadDiagnostics(orderId: string) {
    setDiagnosticsMessage("");
    try {
      const response = await apiClient.getAdminOrderDiagnostics(orderId, apiBase, token);
      setDiagnostics(response);
    } catch (error) {
      setDiagnostics(null);
      setDiagnosticsMessage(error instanceof Error ? error.message : "Nao foi possivel carregar o diagnostico.");
    }
  }

  async function runAdminAction(action: "reprocess" | "release") {
    if (!selectedOrderId) return;
    setIsActing(true);
    setDiagnosticsMessage("");
    try {
      if (action === "reprocess") {
        await apiClient.reprocessAdminOrderDelivery(selectedOrderId, apiBase, token);
        setDiagnosticsMessage("Reprocessamento solicitado com sucesso.");
      } else {
        await apiClient.releaseAdminOrderReservation(selectedOrderId, apiBase, token);
        setDiagnosticsMessage("Reserva liberada com sucesso.");
      }
      await loadDashboard();
      await loadDiagnostics(selectedOrderId);
    } catch (error) {
      setDiagnosticsMessage(error instanceof Error ? error.message : "Nao foi possivel executar a acao.");
    } finally {
      setIsActing(false);
    }
  }

  async function createCredential() {
    if (!credentialForm.productId || !credentialForm.login || !credentialForm.password) {
      setStockMessage("Informe produto, login e senha para cadastrar a credencial.");
      return;
    }

    setIsCreatingCredential(true);
    setStockMessage("");
    try {
      const response = await apiClient.createAdminCredential(credentialForm, apiBase, token);
      setStockMessage(`Credencial adicionada ao estoque: ${response.productSku}.`);
      setCredentialForm((current) => ({
        ...EMPTY_CREDENTIAL_FORM,
        productId: current.productId
      }));
      await loadDashboard();
      await loadCredentials();
    } catch (error) {
      setStockMessage(error instanceof Error ? error.message : "Nao foi possivel cadastrar a credencial.");
    } finally {
      setIsCreatingCredential(false);
    }
  }

  async function invalidateCredential(credential: AdminCredentialResponse) {
    const reason = window.prompt("Motivo da invalidacao", "Invalidada operacionalmente pelo admin");
    if (!reason?.trim()) return;

    setStockMessage("");
    try {
      await apiClient.invalidateAdminCredential(credential.credentialId, reason.trim(), apiBase, token);
      setStockMessage(`Credencial invalidada: ${credential.productSku}.`);
      await loadDashboard();
      await loadCredentials();
    } catch (error) {
      setStockMessage(error instanceof Error ? error.message : "Nao foi possivel invalidar a credencial.");
    }
  }

  async function saveProduct() {
    setIsSavingProduct(true);
    setProductMessage("");
    const priceCents = parsePriceToCents(productForm.priceReais);
    try {
      const response = isCreatingProductMode
        ? await apiClient.createAdminProduct({
            sku: productForm.sku,
            slug: productForm.slug,
            name: productForm.name,
            description: productForm.description,
            category: productForm.category,
            provider: productForm.provider,
            priceCents,
            status: productForm.status,
            durationDays: productForm.durationDays,
            fulfillmentNotes: productForm.fulfillmentNotes
          }, apiBase, token)
        : await apiClient.updateAdminProduct(productForm.id, {
            name: productForm.name,
            description: productForm.description,
            provider: productForm.provider,
            priceCents,
            status: productForm.status,
            durationDays: productForm.durationDays,
            fulfillmentNotes: productForm.fulfillmentNotes
          }, apiBase, token);
      setProductMessage(isCreatingProductMode ? `Produto criado: ${response.sku}.` : `Produto atualizado: ${response.sku}.`);
      setIsCreatingProductMode(false);
      await loadDashboard();
    } catch (error) {
      setProductMessage(error instanceof Error ? error.message : "Nao foi possivel salvar o produto.");
    } finally {
      setIsSavingProduct(false);
    }
  }

  function applyGeneratedProductCodes() {
    setProductForm((current) => {
      const slug = createSlug(current.name || current.provider || "produto");
      return {
        ...current,
        slug,
        sku: createSku(current.category, slug)
      };
    });
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

      <section className="panel-card panel-card-wide">
        <div className="admin-section-head">
          <div>
            <span className="eyebrow">produtos</span>
            <h2>Catalogo operacional</h2>
          </div>
          <div className="button-row">
            <button
              type="button"
              className="secondary-button compact"
              onClick={() => {
                setIsCreatingProductMode(true);
                setProductForm(EMPTY_PRODUCT_FORM);
              }}
            >
              Novo produto
            </button>
            <button type="button" className="secondary-button compact" onClick={() => void loadAdminProducts()}>Atualizar</button>
          </div>
        </div>
        {productMessage ? <div className="inline-banner">{productMessage}</div> : null}
        <div className="product-admin-layout">
          <div className="product-admin-list">
            {adminProducts.map((product) => (
              <button
                key={product.id}
                type="button"
                className={product.id === productForm.id ? "product-admin-row selected" : "product-admin-row"}
                onClick={() => {
                  setIsCreatingProductMode(false);
                  setProductForm(toProductForm(product));
                }}
              >
                <div>
                  <strong>{product.name}</strong>
                  <span>{product.sku} | {humanizeCategory(product.category)}</span>
                </div>
                <div>
                  <span className={`status-pill ${productStatusTone(product.status)}`}>{productStatusLabel(product.status)}</span>
                  <small>{formatCurrency(product.priceCents)} | {formatProductDuration(product.durationDays)} | {product.availableStock ?? 0} em estoque</small>
                </div>
              </button>
            ))}
          </div>
          <div className="product-edit-panel">
            {isCreatingProductMode ? (
              <>
                <label>
                  SKU
                  <input value={productForm.sku} onChange={(event) => setProductForm((current) => ({ ...current, sku: event.target.value }))} />
                  <small className="field-help">Codigo interno unico para estoque, pedidos e suporte.</small>
                </label>
                <label>
                  Slug
                  <input value={productForm.slug} onChange={(event) => setProductForm((current) => ({ ...current, slug: event.target.value }))} />
                  <small className="field-help">Identificador amigavel usado em URLs e buscas tecnicas.</small>
                </label>
                <label>
                  Categoria
                  <select
                    value={productForm.category}
                    onChange={(event) => setProductForm((current) => ({ ...current, category: event.target.value }))}
                    className="admin-select"
                  >
                    <option value="STREAMING">Streaming</option>
                    <option value="ASSINATURA">Assinaturas</option>
                    <option value="GAMES">Games</option>
                  </select>
                </label>
                <div className="code-actions">
                  <button type="button" className="secondary-button compact" onClick={applyGeneratedProductCodes}>
                    Gerar SKU e slug
                  </button>
                  <small>Use depois de preencher nome e categoria.</small>
                </div>
              </>
            ) : null}
            <label>
              Nome
              <input value={productForm.name} onChange={(event) => setProductForm((current) => ({ ...current, name: event.target.value }))} />
            </label>
            <label>
              Plataforma / fornecedor
              <input
                value={productForm.provider}
                onChange={(event) => setProductForm((current) => ({ ...current, provider: event.target.value }))}
                placeholder="Ex: Dota 2, Netflix, Steam"
              />
              <small className="field-help">Marca, jogo, plataforma ou origem operacional do produto.</small>
            </label>
            <label>
              Preco
              <input
                inputMode="decimal"
                value={productForm.priceReais}
                onBlur={() => setProductForm((current) => ({ ...current, priceReais: formatPriceInput(parsePriceToCents(current.priceReais)) }))}
                onChange={(event) => setProductForm((current) => ({ ...current, priceReais: event.target.value }))}
                placeholder="Ex: 25,99"
              />
              <small className="field-help">Digite em reais. Ex: 9,99 ou 189,90.</small>
            </label>
            <label>
              Status
              <select
                value={productForm.status}
                onChange={(event) => setProductForm((current) => ({ ...current, status: event.target.value as AdminProduct["status"] }))}
                className="admin-select"
              >
                <option value="ACTIVE">Ativo</option>
                <option value="INACTIVE">Inativo</option>
                <option value="ARCHIVED">Arquivado</option>
              </select>
            </label>
            <label>
              Duracao em dias
              <input
                type="number"
                min="0"
                disabled={productForm.durationDays === 0}
                value={productForm.durationDays}
                onChange={(event) => setProductForm((current) => ({ ...current, durationDays: Number(event.target.value) }))}
              />
            </label>
            <label className="lifetime-field">
              <input
                type="checkbox"
                checked={productForm.durationDays === 0}
                onChange={(event) => setProductForm((current) => ({
                  ...current,
                  durationDays: event.target.checked ? 0 : 30
                }))}
              />
              <span>
                <strong>Produto vitalicio</strong>
                <small>Use para contas ou acessos sem prazo de expiracao.</small>
              </span>
            </label>
            <label className="wide-field">
              Descricao
              <textarea value={productForm.description} onChange={(event) => setProductForm((current) => ({ ...current, description: event.target.value }))} />
            </label>
            <label className="wide-field">
              Notas de entrega
              <textarea value={productForm.fulfillmentNotes} onChange={(event) => setProductForm((current) => ({ ...current, fulfillmentNotes: event.target.value }))} />
            </label>
            <button type="button" className="primary-button compact" disabled={isSavingProduct || (!isCreatingProductMode && !productForm.id)} onClick={() => void saveProduct()}>
              {isSavingProduct ? "Salvando..." : isCreatingProductMode ? "Criar produto" : "Salvar produto"}
            </button>
          </div>
        </div>
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
          {diagnosticsMessage ? <div className="inline-banner">{diagnosticsMessage}</div> : null}
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
        {stockMessage ? <div className="inline-banner">{stockMessage}</div> : null}
        <div className="credential-create-panel">
          <div>
            <span className="eyebrow">reposicao</span>
            <h3>Cadastrar credencial</h3>
          </div>
          <label>
            Produto
            <select
              value={credentialForm.productId}
              onChange={(event) => setCredentialForm((current) => ({ ...current, productId: event.target.value }))}
              className="admin-select"
            >
              {products.map((product) => (
                <option key={product.id} value={product.id}>{product.name}</option>
              ))}
            </select>
          </label>
          <label>
            Login
            <input
              value={credentialForm.login}
              onChange={(event) => setCredentialForm((current) => ({ ...current, login: event.target.value }))}
              placeholder="login ou email da conta"
            />
          </label>
          <label>
            Senha
            <input
              value={credentialForm.password}
              onChange={(event) => setCredentialForm((current) => ({ ...current, password: event.target.value }))}
              placeholder="senha da conta"
              type="password"
            />
          </label>
          <label>
            Lote
            <input
              value={credentialForm.sourceBatch}
              onChange={(event) => setCredentialForm((current) => ({ ...current, sourceBatch: event.target.value }))}
              placeholder="manual-admin"
            />
          </label>
          <button type="button" className="primary-button compact" disabled={isCreatingCredential} onClick={() => void createCredential()}>
            {isCreatingCredential ? "Cadastrando..." : "Adicionar ao estoque"}
          </button>
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

      <section className="panel-card panel-card-wide">
        <div className="admin-section-head">
          <div>
            <span className="eyebrow">credenciais</span>
            <h2>Estoque operacional</h2>
          </div>
          <button type="button" className="secondary-button compact" onClick={() => void loadCredentials()} disabled={isLoadingCredentials}>
            {isLoadingCredentials ? "Atualizando..." : "Atualizar"}
          </button>
        </div>
        <div className="credential-filters-row">
          <label>
            Produto
            <select value={credentialProductFilter} onChange={(event) => setCredentialProductFilter(event.target.value)} className="admin-select">
              <option value="">Todos</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>{product.name}</option>
              ))}
            </select>
          </label>
          <label>
            Status
            <select value={credentialStatusFilter} onChange={(event) => setCredentialStatusFilter(event.target.value)} className="admin-select">
              <option value="">Todos</option>
              <option value="AVAILABLE">Disponivel</option>
              <option value="RESERVED">Reservada</option>
              <option value="DELIVERED">Entregue</option>
              <option value="INVALID">Invalida</option>
            </select>
          </label>
        </div>
        <div className="credential-admin-list">
          {isLoadingCredentials ? <div className="empty-state-panel">Carregando credenciais...</div> : null}
          {!isLoadingCredentials && credentials.length === 0 ? <div className="empty-state-panel">Nenhuma credencial nesse filtro.</div> : null}
          {credentials.map((credential) => (
            <article key={credential.credentialId} className="credential-admin-row">
              <div>
                <strong>{credential.productName}</strong>
                <span>{credential.productSku} | {credential.sourceBatch || "sem lote"}</span>
                <small>Criada em {formatDate(credential.createdAt)}</small>
              </div>
              <span className={`status-pill ${credentialStatusTone(credential.status)}`}>{credentialStatusLabel(credential.status)}</span>
              <div className="credential-admin-actions">
                <small>{credential.credentialId.slice(0, 8)}</small>
                {credential.status !== "DELIVERED" && credential.status !== "INVALID" ? (
                  <button type="button" className="secondary-button compact" onClick={() => void invalidateCredential(credential)}>
                    Invalidar
                  </button>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

function credentialStatusLabel(status: string) {
  const map: Record<string, string> = {
    AVAILABLE: "Disponivel",
    RESERVED: "Reservada",
    DELIVERED: "Entregue",
    INVALID: "Invalida"
  };
  return map[status] || status;
}

function credentialStatusTone(status: string) {
  if (status === "AVAILABLE") return "success";
  if (status === "RESERVED") return "warning";
  if (status === "DELIVERED") return "info";
  return "danger";
}

function toProductForm(product?: AdminProduct) {
  if (!product) {
    return EMPTY_PRODUCT_FORM;
  }

  return {
    id: product.id,
    sku: product.sku,
    slug: product.slug,
    name: product.name,
    description: product.description || "",
    category: product.category,
    provider: product.provider,
    priceReais: formatPriceInput(product.priceCents),
    status: product.status,
    durationDays: product.durationDays,
    fulfillmentNotes: product.fulfillmentNotes || ""
  };
}

function productStatusLabel(status: string) {
  const map: Record<string, string> = {
    ACTIVE: "Ativo",
    INACTIVE: "Inativo",
    ARCHIVED: "Arquivado"
  };
  return map[status] || status;
}

function productStatusTone(status: string) {
  if (status === "ACTIVE") return "success";
  if (status === "INACTIVE") return "warning";
  return "danger";
}

function formatProductDuration(durationDays: number) {
  return durationDays === 0 ? "Vitalicio" : `${durationDays} dias`;
}

function createSlug(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "produto";
}

function createSku(category: string, slug: string) {
  const categoryPrefix: Record<string, string> = {
    STREAMING: "STR",
    ASSINATURA: "ASS",
    GAMES: "GAME"
  };
  const readableSlug = slug
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `TPM-${categoryPrefix[category] || "PROD"}-${readableSlug}-001`;
}

function parsePriceToCents(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return 0;
  const normalized = trimmed.includes(",")
    ? trimmed.replace(/\./g, "").replace(",", ".")
    : trimmed;
  const parsed = Number(normalized.replace(/[^\d.]/g, ""));
  if (!Number.isFinite(parsed) || parsed < 0) return 0;
  return Math.round(parsed * 100);
}

function formatPriceInput(priceCents: number) {
  return (priceCents / 100).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}
