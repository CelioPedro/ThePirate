import { useEffect, useState } from "react";
import { apiClient } from "../shared/api/client";
import { getProductImageUrl } from "../shared/catalog/catalogData";
import { formatCurrency, formatDate, humanizeCategory, labelStatus, statusTone } from "../shared/lib/format";
import { useSession } from "../shared/session/SessionContext";
import type { AdminCredentialResponse, AdminOrderDiagnostics, AdminOrderSummary, AdminProduct, CatalogCategory, InventoryItem, Product } from "../shared/types";

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
  imageUrl: "",
  categoryId: "",
  category: "STREAMING",
  provider: "",
  priceReais: "0,00",
  status: "ACTIVE" as AdminProduct["status"],
  durationDays: 30,
  fulfillmentNotes: ""
};

type AdminTab = "products" | "stock" | "orders" | "diagnostics";

const ADMIN_TABS: { id: AdminTab; label: string; description: string }[] = [
  { id: "products", label: "Produtos", description: "Catalogo e precificacao" },
  { id: "stock", label: "Estoque", description: "Credenciais e inventario" },
  { id: "orders", label: "Pedidos", description: "Fila operacional" },
  { id: "diagnostics", label: "Diagnostico", description: "Pagamento e entrega" }
];

export function AdminDashboardPage() {
  const { apiBase, token, user } = useSession();
  const [orders, setOrders] = useState<AdminOrderSummary[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [adminProducts, setAdminProducts] = useState<AdminProduct[]>([]);
  const [categories, setCategories] = useState<CatalogCategory[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [credentials, setCredentials] = useState<AdminCredentialResponse[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [diagnostics, setDiagnostics] = useState<AdminOrderDiagnostics | null>(null);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [orderSearch, setOrderSearch] = useState("");
  const [credentialProductFilter, setCredentialProductFilter] = useState("");
  const [credentialStatusFilter, setCredentialStatusFilter] = useState("AVAILABLE");
  const [credentialSearch, setCredentialSearch] = useState("");
  const [revealedCredentialIds, setRevealedCredentialIds] = useState<Set<string>>(new Set());
  const [credentialSecrets, setCredentialSecrets] = useState<Record<string, { login: string; password: string }>>({});
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
  const [activeAdminTab, setActiveAdminTab] = useState<AdminTab>("products");

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
      const [ordersResponse, inventoryResponse, productsResponse, categoriesResponse] = await Promise.all([
        apiClient.getAdminOrders(apiBase, token).catch(() => []),
        apiClient.getInventory(apiBase),
        apiClient.getProducts(apiBase),
        apiClient.getCategories(apiBase).catch(() => [])
      ]);
      setOrders(ordersResponse);
      setInventory(inventoryResponse);
      setProducts(productsResponse);
      setCategories(categoriesResponse);
      setCredentialForm((current) => ({
        ...current,
        productId: current.productId || productsResponse[0]?.id || ""
      }));
      setCredentialProductFilter((current) => current || productsResponse[0]?.id || "");
      setSelectedOrderId((current) => {
        if (current && ordersResponse.some((order) => order.orderId === current)) {
          return current;
        }
        return ordersResponse[0]?.orderId || null;
      });
      await loadAdminProducts(categoriesResponse);
    } finally {
      setIsLoading(false);
    }
  }

  async function loadAdminProducts(availableCategories = categories) {
    try {
      const response = await apiClient.getAdminProducts(apiBase, token);
      setAdminProducts(response);
      setProductForm((current) => {
        if (current.id && response.some((product) => product.id === current.id)) {
          return current;
        }
        return toProductForm(response[0], availableCategories);
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
    await runAdminActionForOrder(selectedOrderId, action);
  }

  async function runAdminActionForOrder(orderId: string, action: "reprocess" | "release") {
    setIsActing(true);
    setDiagnosticsMessage("");
    try {
      if (action === "reprocess") {
        await apiClient.reprocessAdminOrderDelivery(orderId, apiBase, token);
        setDiagnosticsMessage("Reprocessamento solicitado com sucesso.");
      } else {
        await apiClient.releaseAdminOrderReservation(orderId, apiBase, token);
        setDiagnosticsMessage("Reserva liberada com sucesso.");
      }
      setSelectedOrderId(orderId);
      await loadDashboard();
      await loadDiagnostics(orderId);
    } catch (error) {
      setDiagnosticsMessage(error instanceof Error ? error.message : "Nao foi possivel executar a acao.");
    } finally {
      setIsActing(false);
    }
  }

  async function createCredential() {
    const errors = validateCredentialForm(credentialForm);
    if (errors.length > 0) {
      setStockMessage(`Corrija antes de cadastrar: ${errors.join(" ")}`);
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

  async function loadCredentialSecret(credentialId: string, action: "REVEAL" | "COPY_LOGIN" | "COPY_PASSWORD") {
    const cached = credentialSecrets[credentialId];
    if (cached) {
      return cached;
    }
    const response = await apiClient.revealAdminCredential(credentialId, action, apiBase, token);
    const secret = { login: response.login, password: response.password };
    setCredentialSecrets((current) => ({ ...current, [credentialId]: secret }));
    return secret;
  }

  async function copyCredentialValue(credential: AdminCredentialResponse, field: "login" | "password") {
    const label = field === "login" ? "Login" : "Senha";
    try {
      const secret = await loadCredentialSecret(credential.credentialId, field === "login" ? "COPY_LOGIN" : "COPY_PASSWORD");
      await navigator.clipboard.writeText(secret[field]);
      setStockMessage(`${label} copiado para a area de transferencia.`);
    } catch (error) {
      setStockMessage(error instanceof Error ? error.message : `Nao foi possivel copiar ${label.toLowerCase()}.`);
    }
  }

  async function toggleCredentialReveal(credentialId: string) {
    if (!revealedCredentialIds.has(credentialId)) {
      try {
        await loadCredentialSecret(credentialId, "REVEAL");
      } catch (error) {
        setStockMessage(error instanceof Error ? error.message : "Nao foi possivel revelar a credencial.");
        return;
      }
    }

    setRevealedCredentialIds((current) => {
      const next = new Set(current);
      if (next.has(credentialId)) {
        next.delete(credentialId);
      } else {
        next.add(credentialId);
      }
      return next;
    });
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
    setProductMessage("");
    const priceCents = parsePriceToCents(productForm.priceReais);
    const validationErrors = validateProductForm(productForm, isCreatingProductMode, adminProducts, priceCents);
    if (validationErrors.length > 0 || priceCents === null) {
      setProductMessage(`Corrija antes de salvar: ${validationErrors.join(" ")}`);
      return;
    }

    setIsSavingProduct(true);
    try {
      const response = isCreatingProductMode
        ? await apiClient.createAdminProduct({
            sku: productForm.sku,
            slug: productForm.slug,
            name: productForm.name,
            description: productForm.description,
            imageUrl: productForm.imageUrl,
            categoryId: productForm.categoryId || null,
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
            imageUrl: productForm.imageUrl,
            categoryId: productForm.categoryId || null,
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
        sku: createSku(current.categoryId || current.category, slug, categories)
      };
    });
  }

  const metrics = [
    { label: "Pedidos", value: String(orders.length) },
    { label: "Receita", value: formatCurrency(orders.reduce((acc, order) => acc + order.totalCents, 0)) },
    { label: "Estoque total", value: String(inventory.reduce((acc, item) => acc + item.availableStock, 0)) },
    { label: "Criticos", value: String(inventory.filter((item) => item.availableStock <= 3).length) }
  ];

  const filteredOrders = orders.filter((order) => {
    if (statusFilter !== "ALL" && order.status !== statusFilter) return false;
    const term = orderSearch.trim().toLowerCase();
    if (!term) return true;
    return [
      order.orderId,
      order.externalReference || "",
      order.customer.name,
      order.customer.email,
      order.items.map((item) => `${item.productName} ${item.productSku}`).join(" ")
    ].join(" ").toLowerCase().includes(term);
  });
  const selectedOrder = orders.find((order) => order.orderId === selectedOrderId);
  const filteredCredentials = credentials.filter((credential) => {
    const term = credentialSearch.trim().toLowerCase();
    if (!term) return true;
    return [
      credential.productName,
      credential.productSku,
      credential.sourceBatch || "",
      credential.loginHint,
      credential.credentialId
    ].join(" ").toLowerCase().includes(term);
  });

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

      <nav className="admin-tabs" aria-label="Areas do painel administrativo">
        {ADMIN_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={activeAdminTab === tab.id ? "admin-tab active" : "admin-tab"}
            onClick={() => setActiveAdminTab(tab.id)}
          >
            <strong>{tab.label}</strong>
            <span>{tab.description}</span>
          </button>
        ))}
      </nav>

      {activeAdminTab === "products" ? (
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
                setProductForm(createEmptyProductForm(categories));
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
                  setProductForm(toProductForm(product, categories));
                }}
              >
                <span className="product-admin-thumb" aria-hidden="true">
                  <img src={getProductImageUrl(product) || "/brand/ThePirateMaxLogo.png"} alt="" loading="lazy" />
                </span>
                <div className="product-admin-copy">
                  <strong>{product.name}</strong>
                  <span>{product.sku} | {product.categoryName || humanizeCategory(product.categorySlug || product.category)}</span>
                </div>
                <div className="product-admin-meta">
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
                <div className="code-actions">
                  <button type="button" className="secondary-button compact" onClick={applyGeneratedProductCodes}>
                    Gerar SKU e slug
                  </button>
                  <small>Use depois de preencher nome e categoria.</small>
                </div>
              </>
            ) : null}
            <label>
              Categoria
              <select
                value={productForm.categoryId}
                onChange={(event) => {
                  const selectedCategory = categories.find((category) => category.id === event.target.value);
                  setProductForm((current) => ({
                    ...current,
                    categoryId: event.target.value,
                    category: selectedCategory ? legacyCategoryForSlug(selectedCategory.slug) : current.category
                  }));
                }}
                className="admin-select"
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
                {categories.length === 0 ? (
                  <option value="">Categorias indisponiveis</option>
                ) : null}
              </select>
            </label>
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
                onBlur={() => setProductForm((current) => {
                  const parsedPrice = parsePriceToCents(current.priceReais);
                  return parsedPrice === null ? current : { ...current, priceReais: formatPriceInput(parsedPrice) };
                })}
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
              URL da imagem
              <input
                value={productForm.imageUrl}
                onChange={(event) => setProductForm((current) => ({ ...current, imageUrl: event.target.value }))}
                placeholder="https://exemplo.com/capa-produto.jpg"
              />
              <small className="field-help">Imagem usada nos cards do catalogo. Se ficar vazia, o catalogo usa um fallback visual.</small>
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
      ) : null}

      {activeAdminTab === "orders" ? (
      <section className="admin-columns admin-single-column">
        <div className="panel-card">
          <div className="admin-section-head">
            <div>
              <span className="eyebrow">pedidos</span>
              <h2>Fila operacional</h2>
            </div>
            <button type="button" className="secondary-button compact" onClick={() => void loadDashboard()}>
              Atualizar
            </button>
          </div>
          <div className="orders-admin-toolbar">
            <label>
              Busca
              <input
                value={orderSearch}
                onChange={(event) => setOrderSearch(event.target.value)}
                placeholder="Pedido, cliente, produto, SKU ou referencia"
              />
            </label>
            <label>
              Status
              <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="admin-select">
                <option value="ALL">Todos</option>
                <option value="PENDING">Pendente</option>
                <option value="PAID">Pago</option>
                <option value="DELIVERY_PENDING">Em entrega</option>
                <option value="DELIVERED">Entregue</option>
                <option value="DELIVERY_FAILED">Falhou</option>
                <option value="CANCELED">Cancelado</option>
              </select>
            </label>
          </div>
          <div className="orders-list compact">
            {isLoading ? <AdminListSkeleton label="Carregando pedidos" /> : null}
            {!isLoading && filteredOrders.length === 0 ? (
              <div className="empty-state-panel">
                <strong>Nenhum pedido nesse filtro</strong>
                <p>Ajuste a busca ou o status para encontrar outros pedidos.</p>
              </div>
            ) : null}
            {filteredOrders.map((order) => (
              <article key={order.orderId} className={order.orderId === selectedOrderId ? "admin-order-row selected" : "admin-order-row"}>
                <button
                  type="button"
                  className="admin-order-main"
                  onClick={() => {
                    setSelectedOrderId(order.orderId);
                    setActiveAdminTab("diagnostics");
                  }}
                >
                  <div className="order-card-head">
                    <strong>{order.orderId}</strong>
                    <span className={`status-pill ${statusTone(order.status)}`}>{labelStatus(order.status)}</span>
                  </div>
                  <span>{order.items.map((item) => `${item.productName} (${item.quantity})`).join(", ")}</span>
                  <small>{order.customer.name} | {order.customer.email}</small>
                  <small>{formatCurrency(order.totalCents)} | {formatDate(order.createdAt)}</small>
                  {order.failureReason ? <small className="danger-text">{order.failureReason}</small> : null}
                </button>
                <div className="admin-order-quick-actions">
                  <button type="button" className="secondary-button compact" onClick={() => {
                    setSelectedOrderId(order.orderId);
                    setActiveAdminTab("diagnostics");
                  }}>
                    Diagnostico
                  </button>
                  {isOrderReprocessable(order.status) ? (
                    <button type="button" className="secondary-button compact" disabled={isActing} onClick={() => void runAdminActionForOrder(order.orderId, "reprocess")}>
                      Reprocessar
                    </button>
                  ) : null}
                  {isOrderReservationReleasable(order.status) ? (
                    <button type="button" className="secondary-button compact" disabled={isActing} onClick={() => void runAdminActionForOrder(order.orderId, "release")}>
                      Liberar reserva
                    </button>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
      ) : null}

      {activeAdminTab === "diagnostics" ? (
      <section className="admin-columns admin-single-column">
        <div className="panel-card">
          <div className="admin-section-head">
            <div>
              <span className="eyebrow">diagnostico</span>
              <h2>{selectedOrder ? selectedOrder.orderId : "Selecione um pedido"}</h2>
            </div>
            <select
              value={selectedOrderId || ""}
              onChange={(event) => setSelectedOrderId(event.target.value || null)}
              className="admin-select"
            >
              <option value="">Selecionar pedido</option>
              {orders.map((order) => (
                <option key={order.orderId} value={order.orderId}>{order.orderId.slice(0, 8)} - {labelStatus(order.status)}</option>
              ))}
            </select>
          </div>
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
            <div className="empty-state-panel">
              <strong>Diagnostico indisponivel</strong>
              <p>Selecione um pedido na fila operacional para abrir pagamento, entrega e credenciais.</p>
            </div>
          )}
        </div>
      </section>
      ) : null}

      {activeAdminTab === "stock" ? (
      <>
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
          <label>
            Busca
            <input
              value={credentialSearch}
              onChange={(event) => setCredentialSearch(event.target.value)}
              placeholder="Produto, SKU, lote ou login"
            />
          </label>
        </div>
        <div className="credential-admin-list">
          {isLoadingCredentials ? <AdminListSkeleton label="Carregando credenciais" /> : null}
          {!isLoadingCredentials && filteredCredentials.length === 0 ? (
            <div className="empty-state-panel">
              <strong>Nenhuma credencial nesse filtro</strong>
              <p>Troque o produto, status ou busca para revisar outros acessos em estoque.</p>
            </div>
          ) : null}
          {filteredCredentials.map((credential) => (
            <article key={credential.credentialId} className="credential-admin-row">
              <div>
                <strong>{credential.productName}</strong>
                <span>{credential.productSku} | {credential.sourceBatch || "sem lote"}</span>
                <small>Criada em {formatDate(credential.createdAt)}</small>
              </div>
              <span className={`status-pill ${credentialStatusTone(credential.status)}`}>{credentialStatusLabel(credential.status)}</span>
              <div className="credential-secret-fields">
                <div>
                  <span>Login</span>
                  <code>{revealedCredentialIds.has(credential.credentialId) ? credentialSecrets[credential.credentialId]?.login : credential.loginHint}</code>
                </div>
                <div>
                  <span>Senha</span>
                  <code>{revealedCredentialIds.has(credential.credentialId) ? credentialSecrets[credential.credentialId]?.password : "********"}</code>
                </div>
              </div>
              <div className="credential-admin-actions">
                <small>{credential.credentialId.slice(0, 8)}</small>
                <button type="button" className="secondary-button compact" onClick={() => void toggleCredentialReveal(credential.credentialId)}>
                  {revealedCredentialIds.has(credential.credentialId) ? "Ocultar" : "Revelar"}
                </button>
                <button type="button" className="secondary-button compact" onClick={() => void copyCredentialValue(credential, "login")}>
                  Copiar login
                </button>
                <button type="button" className="secondary-button compact" onClick={() => void copyCredentialValue(credential, "password")}>
                  Copiar senha
                </button>
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
      </>
      ) : null}
    </div>
  );
}

function AdminListSkeleton({ label }: { label: string }) {
  return (
    <div className="admin-list-skeleton" aria-label={label}>
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="admin-skeleton-row">
          <span className="skeleton-line medium" />
          <span className="skeleton-line" />
          <span className="skeleton-line short" />
        </div>
      ))}
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

function isOrderReprocessable(status: string) {
  return ["PAID", "DELIVERY_PENDING", "DELIVERY_FAILED"].includes(status);
}

function isOrderReservationReleasable(status: string) {
  return ["PENDING", "CANCELED"].includes(status);
}

function credentialStatusTone(status: string) {
  if (status === "AVAILABLE") return "success";
  if (status === "RESERVED") return "warning";
  if (status === "DELIVERED") return "info";
  return "danger";
}

function validateCredentialForm(form: typeof EMPTY_CREDENTIAL_FORM) {
  const errors: string[] = [];
  if (!form.productId) errors.push("Selecione um produto.");
  if (!form.login.trim()) errors.push("Informe o login.");
  if (!form.password.trim()) errors.push("Informe a senha.");
  return errors;
}

function createEmptyProductForm(categories: CatalogCategory[]) {
  const firstCategory = categories[0];
  return {
    ...EMPTY_PRODUCT_FORM,
    categoryId: firstCategory?.id || "",
    category: firstCategory ? legacyCategoryForSlug(firstCategory.slug) : EMPTY_PRODUCT_FORM.category
  };
}

function toProductForm(product?: AdminProduct, categories: CatalogCategory[] = []) {
  if (!product) {
    return createEmptyProductForm(categories);
  }

  return {
    id: product.id,
    sku: product.sku,
    slug: product.slug,
    name: product.name,
    description: product.description || "",
    imageUrl: product.imageUrl || "",
    categoryId: product.categoryId || categories.find((category) => legacyCategoryForSlug(category.slug) === product.category)?.id || "",
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

function createSku(categoryValue: string, slug: string, categories: CatalogCategory[]) {
  const selectedCategory = categories.find((category) => category.id === categoryValue);
  const category = selectedCategory ? selectedCategory.slug : categoryValue;
  const categoryPrefix: Record<string, string> = {
    STREAMING: "STR",
    ASSINATURA: "ASS",
    GAMES: "GAME",
    "inteligencia-artificial": "IA",
    "assinaturas-premium": "ASS",
    "gift-cards": "GIFT",
    "softwares-licencas": "SOFT",
    "redes-sociais": "SOC",
    "servicos-digitais": "SERV",
    "cursos-treinamentos": "CURSO",
    "contas-digitais": "CONTA"
  };
  const readableSlug = slug
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `TPM-${categoryPrefix[category] || "PROD"}-${readableSlug}-001`;
}

function legacyCategoryForSlug(slug: string) {
  if (slug === "streaming") return "STREAMING";
  if (slug === "games") return "GAMES";
  return "ASSINATURA";
}

function parsePriceToCents(value: string) {
  const trimmed = value.trim();
  if (!trimmed || !/\d/.test(trimmed)) return null;
  const normalized = trimmed.includes(",")
    ? trimmed.replace(/\./g, "").replace(",", ".")
    : trimmed;
  const parsed = Number(normalized.replace(/[^\d.]/g, ""));
  if (!Number.isFinite(parsed) || parsed < 0) return null;
  return Math.round(parsed * 100);
}

function formatPriceInput(priceCents: number) {
  return (priceCents / 100).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function validateProductForm(
  form: typeof EMPTY_PRODUCT_FORM,
  isCreating: boolean,
  products: AdminProduct[],
  priceCents: number | null
) {
  const errors: string[] = [];
  if (isCreating && !form.sku.trim()) errors.push("Informe o SKU.");
  if (isCreating && !form.slug.trim()) errors.push("Informe o slug.");
  if (!form.categoryId && !form.category.trim()) errors.push("Selecione a categoria.");
  if (!form.name.trim()) errors.push("Informe o nome.");
  if (!form.provider.trim()) errors.push("Informe a plataforma ou fornecedor.");
  if (priceCents === null || priceCents <= 0) errors.push("Informe um preco maior que zero.");
  if (!Number.isFinite(form.durationDays) || form.durationDays < 0) errors.push("Informe uma duracao valida.");

  if (isCreating) {
    const normalizedSku = form.sku.trim().toUpperCase();
    const normalizedSlug = form.slug.trim().toLowerCase();
    if (products.some((product) => product.sku.toUpperCase() === normalizedSku)) {
      errors.push("Ja existe um produto com esse SKU.");
    }
    if (products.some((product) => product.slug.toLowerCase() === normalizedSlug)) {
      errors.push("Ja existe um produto com esse slug.");
    }
  }

  return errors;
}
