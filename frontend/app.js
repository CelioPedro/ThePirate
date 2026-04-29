const DEMO_PRODUCTS = [
  {
    id: "demo-netflix",
    sku: "TPM-NETFLIX-001",
    slug: "netflix",
    name: "Netflix Premium",
    description: "Acesso streaming com entrega por credencial e vigencia operacional inicial de 30 dias.",
    category: "STREAMING",
    provider: "NETFLIX",
    priceCents: 999,
    currency: "BRL",
    requiresStock: true,
    regionCode: "BR",
    durationDays: 30,
    fulfillmentNotes: "Perfil streaming com duracao inicial de 30 dias para operacao local.",
    stock: 8,
    artPalette: ["#d94363", "#791b53", "#1a102a"]
  },
  {
    id: "demo-crunchyroll",
    sku: "TPM-CRUNCHYROLL-001",
    slug: "crunchyroll",
    name: "Crunchyroll",
    description: "Streaming de anime com entrega por credencial individual.",
    category: "STREAMING",
    provider: "CRUNCHYROLL",
    priceCents: 999,
    currency: "BRL",
    requiresStock: true,
    regionCode: "BR",
    durationDays: 30,
    fulfillmentNotes: "Acesso streaming com vigencia operacional inicial de 30 dias.",
    stock: 7,
    artPalette: ["#ff9240", "#ff6a00", "#5b2310"]
  },
  {
    id: "demo-amazon-prime",
    sku: "TPM-AMAZON-PRIME-001",
    slug: "amazon-prime",
    name: "Amazon Prime Video",
    description: "Streaming com foco em filmes e series, entregue por credencial.",
    category: "STREAMING",
    provider: "AMAZON_PRIME",
    priceCents: 999,
    currency: "BRL",
    requiresStock: true,
    regionCode: "BR",
    durationDays: 30,
    fulfillmentNotes: "Entrega por credencial com operacao padrao de 30 dias.",
    stock: 7,
    artPalette: ["#2ad1ff", "#1168ff", "#0f223d"]
  },
  {
    id: "demo-hulu",
    sku: "TPM-HULU-001",
    slug: "hulu",
    name: "Hulu",
    description: "Streaming com entrega por credencial e uso operacional controlado.",
    category: "STREAMING",
    provider: "HULU",
    priceCents: 999,
    currency: "BRL",
    requiresStock: true,
    regionCode: "BR",
    durationDays: 30,
    fulfillmentNotes: "Entrega por credencial com operacao inicial de 30 dias.",
    stock: 5,
    artPalette: ["#6dff9b", "#1ec86f", "#0c3321"]
  },
  {
    id: "demo-nba",
    sku: "TPM-NBA-001",
    slug: "nba-league-pass",
    name: "NBA League Pass",
    description: "Acesso streaming esportivo com entrega por credencial.",
    category: "STREAMING",
    provider: "NBA",
    priceCents: 999,
    currency: "BRL",
    requiresStock: true,
    regionCode: "BR",
    durationDays: 30,
    fulfillmentNotes: "Entrega por credencial com vigencia inicial de 30 dias.",
    stock: 4,
    artPalette: ["#f15a5a", "#224b9b", "#121a34"]
  },
  {
    id: "demo-paramount",
    sku: "TPM-PARAMOUNT-001",
    slug: "paramount-plus",
    name: "Paramount+",
    description: "Catalogo streaming focado em series e filmes, com entrega por credencial e uso regional BR.",
    category: "STREAMING",
    provider: "PARAMOUNT_PLUS",
    priceCents: 999,
    currency: "BRL",
    requiresStock: true,
    regionCode: "BR",
    durationDays: 30,
    fulfillmentNotes: "Entrega por credencial com uso regional BR.",
    stock: 6,
    artPalette: ["#42c6ff", "#0e69ff", "#11274d"]
  },
  {
    id: "demo-disney",
    sku: "TPM-DISNEY-001",
    slug: "disney-plus",
    name: "Disney+",
    description: "Streaming familiar com franquias e catalogo infantil, entregue por credencial individual.",
    category: "STREAMING",
    provider: "DISNEY_PLUS",
    priceCents: 999,
    currency: "BRL",
    requiresStock: true,
    regionCode: "BR",
    durationDays: 30,
    fulfillmentNotes: "Entrega individual por credencial com vigencia operacional de 30 dias.",
    stock: 7,
    artPalette: ["#81d8ff", "#2a82ff", "#1c2d63"]
  },
  {
    id: "demo-youtube-premium",
    sku: "TPM-YOUTUBE-001",
    slug: "youtube-premium",
    name: "YouTube Premium",
    description: "Assinatura de video premium com entrega por credencial.",
    category: "STREAMING",
    provider: "YOUTUBE_PREMIUM",
    priceCents: 1299,
    currency: "BRL",
    requiresStock: true,
    regionCode: "BR",
    durationDays: 30,
    fulfillmentNotes: "Entrega por credencial com operacao inicial de 30 dias.",
    stock: 6,
    artPalette: ["#ff5d5d", "#d61919", "#421313"]
  },
  {
    id: "demo-canva",
    sku: "TPM-CANVA-001",
    slug: "canva-pro",
    name: "Canva Pro",
    description: "Ferramenta criativa com acesso por credencial para uso recorrente.",
    category: "ASSINATURA",
    provider: "CANVA",
    priceCents: 699,
    currency: "BRL",
    requiresStock: true,
    regionCode: "BR",
    durationDays: 30,
    fulfillmentNotes: "Licenca operacional via credencial compartilhada controlada.",
    stock: 10,
    artPalette: ["#61f0ff", "#18a5ff", "#133d61"]
  },
  {
    id: "demo-figma",
    sku: "TPM-FIGMA-001",
    slug: "figma",
    name: "Figma",
    description: "Ferramenta de design colaborativo entregue por credencial.",
    category: "ASSINATURA",
    provider: "FIGMA",
    priceCents: 2299,
    currency: "BRL",
    requiresStock: true,
    regionCode: "BR",
    durationDays: 30,
    fulfillmentNotes: "Acesso por credencial com vigencia inicial de 30 dias.",
    stock: 6,
    artPalette: ["#ff7c45", "#9146ff", "#1a1d3d"]
  },
  {
    id: "demo-chatgpt-plus",
    sku: "TPM-CHATGPT-001",
    slug: "chatgpt-plus",
    name: "ChatGPT Plus",
    description: "Acesso premium de IA com entrega por credencial.",
    category: "ASSINATURA",
    provider: "CHATGPT_PLUS",
    priceCents: 2599,
    currency: "BRL",
    requiresStock: true,
    regionCode: "BR",
    durationDays: 30,
    fulfillmentNotes: "Entrega por credencial com orientacao de uso individual.",
    stock: 5,
    artPalette: ["#70f0c2", "#13a67b", "#13382e"]
  },
  {
    id: "demo-antigravity",
    sku: "TPM-ANTIGRAVITY-001",
    slug: "antigravity",
    name: "Antigravity",
    description: "Produto digital premium entregue por credencial.",
    category: "ASSINATURA",
    provider: "ANTIGRAVITY",
    priceCents: 2599,
    currency: "BRL",
    requiresStock: true,
    regionCode: "BR",
    durationDays: 30,
    fulfillmentNotes: "Entrega por credencial com operacao inicial de 30 dias.",
    stock: 4,
    artPalette: ["#f4a4ff", "#7f53ff", "#24114d"]
  },
  {
    id: "demo-lol-d1",
    sku: "TPM-LOL-D1-001",
    slug: "lol-diamante-1",
    name: "Conta LoL Diamante 1",
    description: "Conta de League of Legends pronta para uso em tier Diamante 1.",
    category: "GAMES",
    provider: "LEAGUE_OF_LEGENDS",
    priceCents: 24990,
    currency: "BRL",
    requiresStock: true,
    regionCode: "BR",
    durationDays: 0,
    fulfillmentNotes: "Entrega de conta individual com troca imediata de acesso recomendada.",
    stock: 3,
    artPalette: ["#ffd36a", "#b07c17", "#25160b"]
  },
  {
    id: "demo-lol-p2",
    sku: "TPM-LOL-P2-001",
    slug: "lol-platina-2",
    name: "Conta LoL Platina 2",
    description: "Conta de League of Legends pronta para uso em tier Platina 2.",
    category: "GAMES",
    provider: "LEAGUE_OF_LEGENDS",
    priceCents: 15890,
    currency: "BRL",
    requiresStock: true,
    regionCode: "BR",
    durationDays: 0,
    fulfillmentNotes: "Entrega de conta individual com troca imediata de acesso recomendada.",
    stock: 4,
    artPalette: ["#b7f0ff", "#4da3cc", "#113347"]
  },
  {
    id: "demo-lol-chall",
    sku: "TPM-LOL-CHALL-001",
    slug: "lol-desafiante",
    name: "Conta LoL Desafiante",
    description: "Conta de League of Legends pronta para uso em tier Desafiante.",
    category: "GAMES",
    provider: "LEAGUE_OF_LEGENDS",
    priceCents: 38999,
    currency: "BRL",
    requiresStock: true,
    regionCode: "BR",
    durationDays: 0,
    fulfillmentNotes: "Entrega de conta individual com prioridade operacional.",
    stock: 2,
    artPalette: ["#ffd97f", "#ff9b2f", "#3a1d0d"]
  }
];

const CATEGORY_ART = {
  STREAMING: ["#2ad1ff", "#1168ff", "#0f223d"],
  ASSINATURA: ["#70f0c2", "#13a67b", "#13382e"],
  GAMES: ["#ffd97f", "#ff9b2f", "#3a1d0d"]
};

const state = {
  mode: "demo",
  apiBase: "http://localhost:8080",
  products: [],
  inventory: [],
  cart: [],
  customerOrders: [],
  sellerOrders: [],
  currentPix: null,
  selectedCredentials: null,
  livePollingHandle: null,
  auth: {
    token: localStorage.getItem("tpm-auth-token"),
    user: safeParse(localStorage.getItem("tpm-auth-user")),
    mode: "guest"
  }
};

const elements = {
  tabs: [...document.querySelectorAll(".tab")],
  views: {
    customer: document.getElementById("customerView"),
    seller: document.getElementById("sellerView")
  },
  productGrid: document.getElementById("productGrid"),
  categoryRail: document.getElementById("categoryRail"),
  cartItems: document.getElementById("cartItems"),
  cartTotal: document.getElementById("cartTotal"),
  checkoutButton: document.getElementById("checkoutButton"),
  customerOrders: document.getElementById("customerOrders"),
  sellerOrders: document.getElementById("sellerOrders"),
  sellerProducts: document.getElementById("sellerProducts"),
  sellerMetrics: document.getElementById("sellerMetrics"),
  pixState: document.getElementById("pixState"),
  credentialsPanel: document.getElementById("credentialsPanel"),
  modeLabel: document.getElementById("modeLabel"),
  modeHelp: document.getElementById("modeHelp"),
  statusDot: document.getElementById("statusDot"),
  connectButton: document.getElementById("connectButton"),
  authToggleButton: document.getElementById("authToggleButton"),
  heroBackendButton: document.getElementById("heroBackendButton"),
  heroExploreButton: document.getElementById("heroExploreButton"),
  apiBaseInput: document.getElementById("apiBaseInput"),
  productCount: document.getElementById("productCount"),
  customerOrderCount: document.getElementById("customerOrderCount"),
  searchInput: document.getElementById("searchInput"),
  authPanel: document.getElementById("authPanel")
};

init();

function init() {
  loadDemoState();
  bindEvents();
  boot();
}

function bindEvents() {
  elements.tabs.forEach((tab) => {
    tab.addEventListener("click", () => switchView(tab.dataset.view));
  });

  elements.checkoutButton.addEventListener("click", checkout);
  elements.connectButton.addEventListener("click", connectBackend);
  elements.authToggleButton.addEventListener("click", toggleAuthPanelFocus);
  elements.heroBackendButton.addEventListener("click", connectBackend);
  elements.heroExploreButton.addEventListener("click", () => {
    document.getElementById("operations").scrollIntoView({ behavior: "smooth", block: "start" });
  });
  elements.apiBaseInput.addEventListener("change", (event) => {
    state.apiBase = event.target.value.trim();
  });
  elements.searchInput.addEventListener("input", renderProducts);
}

async function boot() {
  await loadProducts();
  await hydrateAuthState();
  render();
}

function switchView(view) {
  elements.tabs.forEach((tab) => tab.classList.toggle("active", tab.dataset.view === view));
  Object.entries(elements.views).forEach(([key, node]) => node.classList.toggle("active", key === view));
}

async function connectBackend() {
  state.apiBase = elements.apiBaseInput.value.trim();
  try {
    state.mode = "live";
    await hydrateLiveState();
    await hydrateAuthState();
    setModeBadge();
    render();
  } catch (error) {
    state.mode = "demo";
    state.auth.mode = "guest";
    state.auth.user = null;
    state.inventory = buildInventoryFromProducts(state.products);
    setModeBadge("Backend indisponivel. Continuando em demo.");
    render();
  }
}

async function loadProducts() {
  try {
    state.mode = "live";
    await hydrateLiveState();
  } catch (error) {
    state.mode = "demo";
    state.auth.mode = "guest";
    state.products = loadDemoProducts();
    state.inventory = buildInventoryFromProducts(state.products);
    stopLivePolling();
  }
  setModeBadge();
}

function normalizeProducts(products) {
  return products.map((product, index) => ({
    ...product,
    stock: product.availableStock ?? product.stock ?? estimateStock(product.priceCents),
    artPalette: DEMO_PRODUCTS[index % DEMO_PRODUCTS.length].artPalette
  }));
}

function loadDemoProducts() {
  return DEMO_PRODUCTS.map((product) => ({ ...product }));
}

function normalizeInventory(inventory) {
  return inventory.map((item) => ({ ...item, availableStock: item.availableStock ?? 0 }));
}

function buildInventoryFromProducts(products) {
  return products.map((product) => ({
    sku: product.sku,
    slug: product.slug,
    name: product.name,
    provider: product.provider,
    priceCents: product.priceCents,
    availableStock: product.stock ?? 0
  }));
}

function estimateStock(priceCents) {
  return Math.max(4, 18 - Math.floor(priceCents / 700));
}

function loadDemoState() {
  const stored = safeParse(localStorage.getItem("tpm-demo-state"));
  if (!stored) {
    state.customerOrders = [];
    state.sellerOrders = [];
    return;
  }
  state.customerOrders = stored.customerOrders || [];
  state.sellerOrders = stored.sellerOrders || [];
  state.currentPix = stored.currentPix || null;
}

function persistDemoState() {
  localStorage.setItem("tpm-demo-state", JSON.stringify({
    customerOrders: state.customerOrders,
    sellerOrders: state.sellerOrders,
    currentPix: state.currentPix
  }));
}

async function hydrateLiveState() {
  const [products, inventory] = await Promise.all([
    fetchJson(`${state.apiBase}/api/products`),
    fetchJson(`${state.apiBase}/api/products/inventory`)
  ]);
  state.products = normalizeProducts(products);
  state.inventory = normalizeInventory(inventory);
  await refreshLiveOrders();
  startLivePolling();
}

async function hydrateAuthState() {
  if (state.mode !== "live") {
    state.auth.mode = "guest";
    state.auth.user = null;
    return;
  }

  try {
    const user = await fetchJson(`${state.apiBase}/api/auth/me`, { skipAuth: !state.auth.token });
    state.auth.user = user;
    state.auth.mode = state.auth.token ? "authenticated" : "dev-fallback";
    persistAuthState();
  } catch (error) {
    state.auth.mode = "guest";
    state.auth.user = null;
    if (error.status === 401 || error.status === 403) {
      clearAuthToken();
    }
  }
}

async function refreshLiveOrders() {
  if (state.mode !== "live") return;

  try {
    const summaries = await fetchJson(`${state.apiBase}/api/orders`);
    const details = await Promise.all(summaries.map((order) => fetchJson(`${state.apiBase}/api/orders/${order.id}`)));

    state.customerOrders = details.map(normalizeLiveOrder);
    state.sellerOrders = [...state.customerOrders];

    const activeOrder = [...state.customerOrders].reverse().find((order) =>
      ["PENDING", "PAID", "DELIVERY_PENDING"].includes(order.status)
    );

    if (activeOrder) {
      state.currentPix = {
        ...(state.currentPix || {}),
        orderId: activeOrder.id,
        externalReference: state.currentPix?.externalReference || activeOrder.externalReference || null
      };
    } else if (state.currentPix && state.customerOrders.every((order) => order.id !== state.currentPix.orderId)) {
      state.currentPix = null;
    }
  } catch (error) {
    if (error.status === 401 || error.status === 403) {
      state.customerOrders = [];
      state.sellerOrders = [];
      state.currentPix = null;
      return;
    }
    throw error;
  }
}

function normalizeLiveOrder(order) {
  return {
    id: order.id,
    status: order.status,
    paymentMethod: order.paymentMethod,
    totalCents: order.totalCents,
    currency: order.currency,
    createdAt: order.createdAt,
    paidAt: order.paidAt,
    deliveredAt: order.deliveredAt,
    items: (order.items || []).map((item) => ({
      id: item.id,
      productId: item.productId,
      name: item.productName,
      productName: item.productName,
      quantity: item.quantity,
      unitPriceCents: item.unitPriceCents,
      totalPriceCents: item.totalPriceCents
    }))
  };
}

function startLivePolling() {
  stopLivePolling();
  state.livePollingHandle = window.setInterval(async () => {
    try {
      await refreshLiveOrders();
      render();
    } catch (error) {
      stopLivePolling();
      state.mode = "demo";
      setModeBadge("Backend indisponivel. Continuando em demo.");
      render();
    }
  }, 5000);
}

function stopLivePolling() {
  if (state.livePollingHandle) {
    window.clearInterval(state.livePollingHandle);
    state.livePollingHandle = null;
  }
}

function render() {
  renderAuthPanel();
  renderCategories();
  renderProducts();
  renderCart();
  renderCustomerOrders();
  renderPixState();
  renderCredentialsPanel();
  renderSellerOrders();
  renderSellerProducts();
  renderSellerMetrics();
  elements.productCount.textContent = String(state.products.length);
  elements.customerOrderCount.textContent = String(state.customerOrders.length);
}

function renderAuthPanel() {
  if (state.mode !== "live") {
    elements.authToggleButton.textContent = "Entrar";
    elements.authPanel.className = "stack empty-state";
    elements.authPanel.textContent = "Conecte o backend para usar autenticacao e pedidos por conta.";
    return;
  }

  if (state.auth.user && state.auth.mode === "authenticated") {
    elements.authToggleButton.textContent = state.auth.user.name?.split(" ")[0] || "Conta";
    elements.authPanel.className = "auth-stack";
    elements.authPanel.innerHTML = `
      <article class="auth-summary stack">
        <span class="section-kicker">${state.auth.mode === "authenticated" ? "sessao ativa" : "sessao dev local"}</span>
        <strong>${state.auth.user.name || state.auth.user.email}</strong>
        <div class="auth-meta">${state.auth.user.email} | ${humanizeRole(state.auth.user.role)}</div>
        <div class="auth-actions-row">
          <button class="ghost" data-auth-action="refresh">Atualizar conta</button>
          ${state.auth.token ? '<button class="ghost" data-auth-action="logout">Sair</button>' : ""}
        </div>
      </article>
    `;

    elements.authPanel.querySelector('[data-auth-action="refresh"]').addEventListener("click", async () => {
      await hydrateAuthState();
      await refreshLiveOrders();
      render();
    });

    const logoutButton = elements.authPanel.querySelector('[data-auth-action="logout"]');
    if (logoutButton) {
      logoutButton.addEventListener("click", async () => {
        clearAuthToken();
        await hydrateAuthState();
        await refreshLiveOrders();
        render();
      });
    }
    return;
  }

  if (state.auth.user && state.auth.mode === "dev-fallback") {
    elements.authToggleButton.textContent = "Entrar";
    elements.authPanel.className = "auth-stack";
    elements.authPanel.innerHTML = `
      <article class="auth-summary stack">
        <span class="section-kicker">sessao dev local</span>
        <strong>${state.auth.user.name || state.auth.user.email}</strong>
        <div class="auth-meta">${state.auth.user.email} | ${humanizeRole(state.auth.user.role)}</div>
        <div class="auth-meta">Voce pode testar com essa sessao local ou entrar/criar uma conta real abaixo.</div>
      </article>
      <div class="auth-actions-row">
        <button class="ghost" data-auth-focus="login">Entrar com outra conta</button>
        <button class="ghost" data-auth-focus="register">Criar conta</button>
      </div>
      <form class="auth-form stack" data-auth-form="login">
        <div class="auth-inline">
          <input class="auth-input" type="email" name="email" placeholder="Email" autocomplete="email" required />
          <input class="auth-input" type="password" name="password" placeholder="Senha" autocomplete="current-password" required />
        </div>
        <button type="submit">Entrar</button>
      </form>
      <form class="auth-form stack" data-auth-form="register">
        <input class="auth-input" type="text" name="name" placeholder="Nome" autocomplete="name" required />
        <div class="auth-inline">
          <input class="auth-input" type="email" name="email" placeholder="Email" autocomplete="email" required />
          <input class="auth-input" type="password" name="password" placeholder="Senha (min. 6 caracteres)" autocomplete="new-password" minlength="6" required />
        </div>
        <button type="submit">Criar conta</button>
      </form>
    `;

    elements.authPanel.querySelectorAll("[data-auth-focus]").forEach((button) => {
      button.addEventListener("click", () => {
        const form = elements.authPanel.querySelector(`[data-auth-form="${button.dataset.authFocus}"] input`);
        form?.focus();
      });
    });
    elements.authPanel.querySelector('[data-auth-form="login"]').addEventListener("submit", submitLogin);
    elements.authPanel.querySelector('[data-auth-form="register"]').addEventListener("submit", submitRegister);
    return;
  }

  elements.authToggleButton.textContent = "Entrar";
  elements.authPanel.className = "auth-stack";
  elements.authPanel.innerHTML = `
    <div class="auth-actions-row">
      <button class="ghost" data-auth-focus="login">Entrar</button>
      <button class="ghost" data-auth-focus="register">Criar conta</button>
    </div>
    <form class="auth-form stack" data-auth-form="login">
      <div class="auth-inline">
        <input class="auth-input" type="email" name="email" placeholder="Email" autocomplete="email" required />
        <input class="auth-input" type="password" name="password" placeholder="Senha" autocomplete="current-password" required />
      </div>
      <button type="submit">Entrar</button>
    </form>
    <form class="auth-form stack" data-auth-form="register">
      <input class="auth-input" type="text" name="name" placeholder="Nome" autocomplete="name" required />
      <div class="auth-inline">
        <input class="auth-input" type="email" name="email" placeholder="Email" autocomplete="email" required />
        <input class="auth-input" type="password" name="password" placeholder="Senha (min. 6 caracteres)" autocomplete="new-password" minlength="6" required />
      </div>
      <button type="submit">Criar conta</button>
    </form>
  `;

  elements.authPanel.querySelectorAll("[data-auth-focus]").forEach((button) => {
    button.addEventListener("click", () => {
      const form = elements.authPanel.querySelector(`[data-auth-form="${button.dataset.authFocus}"] input`);
      form?.focus();
    });
  });
  elements.authPanel.querySelector('[data-auth-form="login"]').addEventListener("submit", submitLogin);
  elements.authPanel.querySelector('[data-auth-form="register"]').addEventListener("submit", submitRegister);
}

function renderCategories() {
  const template = document.getElementById("categoryCardTemplate");
  const categories = summarizeCategories();
  elements.categoryRail.innerHTML = "";
  categories.forEach((category) => {
    const node = template.content.firstElementChild.cloneNode(true);
    node.querySelector(".category-count").textContent = `${category.count} produtos`;
    node.querySelector(".category-title").textContent = category.title;
    node.querySelector(".category-subtitle").textContent = category.subtitle;
    node.querySelector(".category-image").src = createPosterArt(category.title, category.palette, 280, 360);
    node.querySelector(".category-image").alt = category.title;
    elements.categoryRail.appendChild(node);
  });
}

function summarizeCategories() {
  const grouped = new Map();
  state.products.forEach((product) => {
    const key = product.category || "STREAMING";
    const current = grouped.get(key) || [];
    current.push(product);
    grouped.set(key, current);
  });

  return [...grouped.entries()].map(([category, products]) => ({
    key: category,
    title: humanizeCategory(category),
    count: products.length,
    subtitle: products.slice(0, 3).map((product) => product.name).join(" | "),
    palette: CATEGORY_ART[category] || CATEGORY_ART.STREAMING
  }));
}

function renderProducts() {
  const template = document.getElementById("productCardTemplate");
  const search = elements.searchInput.value.trim().toLowerCase();
  const products = state.products.filter((product) => {
    if (!search) return true;
    return `${product.name} ${product.sku} ${product.description}`.toLowerCase().includes(search);
  });

  elements.productGrid.innerHTML = "";

  products.forEach((product) => {
    const node = template.content.firstElementChild.cloneNode(true);
    node.querySelector(".product-image").src = createPosterArt(product.name, product.artPalette, 640, 400);
    node.querySelector(".product-image").alt = product.name;
    node.querySelector(".product-sku").textContent = product.sku;
    node.querySelector(".pill").textContent = product.requiresStock ? `${product.stock} em estoque` : "PIX";
    node.querySelector("h3").textContent = product.name;
    node.querySelector("p").textContent = `${product.description} | ${humanizeCategory(product.category)} ${product.provider ? `| ${humanizeProvider(product.provider)}` : ""} ${product.durationDays ? `| ${product.durationDays} dias` : ""}`.trim();
    node.querySelector(".product-price").textContent = formatCurrency(product.priceCents);
    node.querySelector(".add-product").addEventListener("click", () => addToCart(product.id));
    elements.productGrid.appendChild(node);
  });
}

function renderCart() {
  if (state.cart.length === 0) {
    elements.cartItems.className = "cart-items empty-state";
    elements.cartItems.textContent = "Nenhum item selecionado.";
  } else {
    elements.cartItems.className = "cart-items stack";
    elements.cartItems.innerHTML = "";
    state.cart.forEach((item) => {
      const row = document.createElement("div");
      row.className = "cart-row";
      row.innerHTML = `
        <div>
          <strong>${item.name}</strong>
          <small>${item.sku}</small>
        </div>
        <span>${formatCurrency(item.priceCents)}</span>
        <button class="ghost" aria-label="Remover item">-</button>
      `;
      row.querySelector("button").addEventListener("click", () => removeFromCart(item.id));
      elements.cartItems.appendChild(row);
    });
  }

  elements.cartTotal.textContent = formatCurrency(getCartTotal());
}

function renderCustomerOrders() {
  if (state.customerOrders.length === 0) {
    elements.customerOrders.className = "stack empty-state";
    elements.customerOrders.textContent = "Nenhum pedido ainda.";
    return;
  }

  elements.customerOrders.className = "stack";
  elements.customerOrders.innerHTML = "";

  [...state.customerOrders].reverse().forEach((order) => {
    const card = document.createElement("article");
    card.className = "order-card";
    const itemNames = (order.items || []).map((item) => item.name || item.productName).join(", ") || "Itens do pedido";
    card.innerHTML = `
      <header>
        <div>
          <strong>${order.id}</strong>
          <small>${itemNames}</small>
        </div>
        <span class="order-status ${statusClass(order.status)}">${labelStatus(order.status)}</span>
      </header>
      <div class="stack">
        <small>Total ${formatCurrency(order.totalCents)}</small>
        <small>Criado em ${formatDate(order.createdAt)}</small>
        <small>${customerStatusCopy(order.status)}</small>
      </div>
    `;

    if (state.mode === "live") {
      const actions = document.createElement("div");
      actions.className = "inline-actions";

      const refreshButton = document.createElement("button");
      refreshButton.className = "ghost";
      refreshButton.textContent = "Atualizar";
      refreshButton.addEventListener("click", async () => {
        await refreshLiveOrders();
        render();
      });
      actions.appendChild(refreshButton);

      if (order.status === "DELIVERED") {
        const credentialsButton = document.createElement("button");
        credentialsButton.className = "ghost";
        credentialsButton.textContent = "Ver credenciais";
        credentialsButton.addEventListener("click", async () => {
          await loadOrderCredentials(order.id);
        });
        actions.appendChild(credentialsButton);
      }

      card.appendChild(actions);
    }

    elements.customerOrders.appendChild(card);
  });
}

function renderPixState() {
  if (!state.currentPix) {
    elements.pixState.className = "stack empty-state";
    elements.pixState.textContent = "Gere um pedido para visualizar QR Code e copia-e-cola.";
    return;
  }

  elements.pixState.className = "stack";
  elements.pixState.innerHTML = `
    <article class="pix-block">
      <div class="section-kicker">Pedido ${state.currentPix.orderId}</div>
      <h3>PIX pronto para pagamento</h3>
      <p>${state.mode === "live" ? "Resposta vinda do backend local." : "Simulacao local para destravar a interface."}</p>
      <code>${state.currentPix.copyPaste}</code>
      ${state.currentPix.expiresAt ? `<small>Expira em ${formatDate(state.currentPix.expiresAt)}</small>` : ""}
    </article>
  `;

  if (state.mode === "live" && state.currentPix.externalReference) {
    const actions = document.createElement("div");
    actions.className = "inline-actions";

    const simulateButton = document.createElement("button");
    simulateButton.className = "ghost";
    simulateButton.textContent = "Simular pagamento";
    simulateButton.addEventListener("click", async () => {
      await simulatePaymentApproval(state.currentPix.externalReference);
    });
    actions.appendChild(simulateButton);

    const refreshButton = document.createElement("button");
    refreshButton.className = "ghost";
    refreshButton.textContent = "Consultar status";
    refreshButton.addEventListener("click", async () => {
      await refreshLiveOrders();
      render();
    });
    actions.appendChild(refreshButton);

    elements.pixState.appendChild(actions);
  }
}

function renderCredentialsPanel() {
  if (!state.selectedCredentials) {
    elements.credentialsPanel.className = "stack empty-state";
    elements.credentialsPanel.textContent = "Credenciais entregues aparecerao aqui.";
    return;
  }

  elements.credentialsPanel.className = "credentials-list";
  elements.credentialsPanel.innerHTML = "";

  state.selectedCredentials.credentials.forEach((credential) => {
    const card = document.createElement("article");
    card.className = "credential-card";
    card.innerHTML = `
      <strong>${credential.productName}</strong>
      <small>${credential.orderItemId}</small>
      <code>login: ${credential.login}</code>
      <code>senha: ${credential.password}</code>
    `;
    elements.credentialsPanel.appendChild(card);
  });
}

function renderSellerOrders() {
  const orders = state.sellerOrders.length > 0 ? state.sellerOrders : state.customerOrders;
  if (orders.length === 0) {
    elements.sellerOrders.className = "stack empty-state";
    elements.sellerOrders.textContent = "Nenhum pedido processado ainda.";
    return;
  }

  elements.sellerOrders.className = "stack";
  elements.sellerOrders.innerHTML = "";
  [...orders].reverse().forEach((order) => {
    const card = document.createElement("article");
    card.className = "order-card";
    const itemNames = (order.items || []).map((item) => item.name || item.productName).join(", ") || "Itens do pedido";
    card.innerHTML = `
      <header>
        <div>
          <strong>${order.id}</strong>
          <small>${(order.items || []).length} item(ns)</small>
        </div>
        <span class="order-status ${statusClass(order.status)}">${labelStatus(order.status)}</span>
      </header>
      <div class="stack">
        <small>${itemNames}</small>
        <small>Total ${formatCurrency(order.totalCents)}</small>
      </div>
    `;
    if (state.mode === "demo") {
      const actionBar = document.getElementById("sellerActionTemplate").content.firstElementChild.cloneNode(true);
      actionBar.querySelectorAll(".seller-action").forEach((button) => {
        button.addEventListener("click", () => {
          order.status = button.dataset.status;
          persistDemoState();
          render();
        });
      });
      card.appendChild(actionBar);
    }
    elements.sellerOrders.appendChild(card);
  });
}

function renderSellerProducts() {
  elements.sellerProducts.innerHTML = "";
  state.inventory.forEach((inventoryItem) => {
    const product = state.products.find((entry) => entry.sku === inventoryItem.sku) || inventoryItem;
    const stock = inventoryItem.availableStock ?? product.stock ?? 0;
    const row = document.createElement("article");
    row.className = "stock-row";
    row.innerHTML = `
      <div>
        <header>
          <strong>${product.name}</strong>
          <span class="stock-status ${stock > 5 ? "status-delivered" : "status-pending"}">
            ${stock > 5 ? "Estavel" : "Atencao"}
          </span>
        </header>
        <small>${product.sku} | ${humanizeProvider(product.provider || product.name)} | ${product.regionCode || "BR"} | ${formatDuration(product.durationDays)}</small>
      </div>
      <strong>${stock}</strong>
      <small>credenciais</small>
    `;
    elements.sellerProducts.appendChild(row);
  });
}

function renderSellerMetrics() {
  const availableStock = state.inventory.reduce((acc, item) => acc + (item.availableStock ?? 0), 0);
  const criticalSkus = state.inventory.filter((item) => (item.availableStock ?? 0) <= 3).length;
  const metrics = [
    { label: "Pedidos", value: state.customerOrders.length },
    { label: "Receita", value: formatCurrency(sumOrders()) },
    { label: "Estoque", value: String(availableStock) },
    { label: "Criticos", value: String(criticalSkus) }
  ];

  elements.sellerMetrics.innerHTML = "";
  metrics.forEach((metric) => {
    const card = document.createElement("article");
    card.className = "metric-card";
    card.innerHTML = `<span class="section-kicker">${metric.label}</span><strong>${metric.value}</strong>`;
    elements.sellerMetrics.appendChild(card);
  });
}

function addToCart(productId) {
  const product = state.products.find((item) => item.id === productId);
  if (!product) return;
  state.cart.push(product);
  renderCart();
}

function removeFromCart(productId) {
  const index = state.cart.findIndex((item) => item.id === productId);
  if (index >= 0) {
    state.cart.splice(index, 1);
    renderCart();
  }
}

async function checkout() {
  if (state.cart.length === 0) {
    alert("Adicione pelo menos um produto.");
    return;
  }

  if (state.mode === "live") {
    await checkoutLive();
  } else {
    checkoutDemo();
  }
}

async function checkoutLive() {
  if (!state.auth.user) {
    alert("Entre com uma conta para criar pedidos no fluxo autenticado.");
    toggleAuthPanelFocus();
    return;
  }

  const payload = {
    items: state.cart.map((item) => ({
      productId: item.id,
      quantity: 1
    })),
    paymentMethod: "PIX"
  };

  try {
    const response = await fetchJson(`${state.apiBase}/api/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const order = {
      id: response.order.id,
      externalReference: response.order.externalReference,
      status: response.order.status,
      totalCents: response.order.totalCents,
      createdAt: response.order.createdAt,
      items: [...state.cart]
    };

    state.customerOrders.push(order);
    state.sellerOrders.push(order);
    state.currentPix = {
      orderId: response.order.id,
      externalReference: response.order.externalReference,
      copyPaste: response.payment.copyPaste,
      expiresAt: response.payment.expiresAt
    };
    state.cart = [];
    await refreshLiveOrders();
    await syncInventory();
    render();
  } catch (error) {
    if (error.status === 401 || error.status === 403) {
      alert("Sua sessao expirou. Entre novamente para continuar.");
      clearAuthToken();
      await hydrateAuthState();
      render();
      return;
    }
    alert("Nao foi possivel falar com o backend. Voltando ao modo demo.");
    state.mode = "demo";
    setModeBadge();
    checkoutDemo();
  }
}

function checkoutDemo() {
  const totalCents = getCartTotal();
  const id = `TPM-${Date.now()}`;
  const order = {
    id,
    status: "PENDING",
    totalCents,
    createdAt: new Date().toISOString(),
    items: [...state.cart]
  };

  state.customerOrders.push(order);
  state.sellerOrders.push(order);

  state.cart.forEach((item) => {
    const product = state.products.find((productEntry) => productEntry.id === item.id);
    if (product && product.stock > 0) product.stock -= 1;
  });
  state.inventory = buildInventoryFromProducts(state.products);

  state.currentPix = {
    orderId: id,
    copyPaste: `00020101021226THEPIRATEMAX${id.replace(/[^A-Z0-9]/gi, "").toUpperCase()}`
  };

  window.setTimeout(() => {
    order.status = "DELIVERY_PENDING";
    render();
  }, 800);

  window.setTimeout(() => {
    order.status = "DELIVERED";
    persistDemoState();
    render();
  }, 2200);

  state.cart = [];
  persistDemoState();
  render();
}

async function syncInventory() {
  if (state.mode !== "live") {
    state.inventory = buildInventoryFromProducts(state.products);
    return;
  }

  try {
    const inventory = await fetchJson(`${state.apiBase}/api/products/inventory`);
    state.inventory = normalizeInventory(inventory);
    state.products = state.products.map((product) => {
      const item = state.inventory.find((entry) => entry.sku === product.sku);
      return item ? { ...product, stock: item.availableStock } : product;
    });
  } catch (error) {
    state.inventory = buildInventoryFromProducts(state.products);
  }
}

async function loadOrderCredentials(orderId) {
  if (state.mode !== "live") return;

  try {
    state.selectedCredentials = await fetchJson(`${state.apiBase}/api/orders/${orderId}/credentials`);
    render();
  } catch (error) {
    if (error.status === 401 || error.status === 403) {
      alert("Entre com sua conta para visualizar as credenciais.");
      toggleAuthPanelFocus();
      return;
    }
    alert("As credenciais ainda nao estao disponiveis.");
  }
}

async function simulatePaymentApproval(externalReference) {
  const payload = {
    action: "payment.updated",
    data: {
      id: `dev-${Date.now()}`,
      status: "approved",
      external_reference: externalReference
    }
  };

  try {
    await fetchJson(`${state.apiBase}/api/webhooks/mercadopago`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    await refreshLiveOrders();
    await syncInventory();
    render();
  } catch (error) {
    alert("Nao foi possivel simular o pagamento no backend local.");
  }
}

async function submitLogin(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const formData = new FormData(form);
  const payload = {
    email: String(formData.get("email") || "").trim(),
    password: String(formData.get("password") || "")
  };

  try {
    const response = await fetchJson(`${state.apiBase}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      skipAuth: true
    });
    applyAuthResponse(response);
    form.reset();
    await refreshLiveOrders();
    render();
  } catch (error) {
    alert("Nao foi possivel entrar agora. Confira email e senha.");
  }
}

async function submitRegister(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const formData = new FormData(form);
  const payload = {
    name: String(formData.get("name") || "").trim(),
    email: String(formData.get("email") || "").trim(),
    password: String(formData.get("password") || "")
  };

  try {
    const response = await fetchJson(`${state.apiBase}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      skipAuth: true
    });
    applyAuthResponse(response);
    form.reset();
    await refreshLiveOrders();
    render();
  } catch (error) {
    alert("Nao foi possivel criar a conta agora. Tente outro email.");
  }
}

function applyAuthResponse(response) {
  state.auth.token = response.token;
  state.auth.user = response.user;
  state.auth.mode = "authenticated";
  persistAuthState();
}

function persistAuthState() {
  if (state.auth.token) {
    localStorage.setItem("tpm-auth-token", state.auth.token);
  } else {
    localStorage.removeItem("tpm-auth-token");
  }

  if (state.auth.user) {
    localStorage.setItem("tpm-auth-user", JSON.stringify(state.auth.user));
  } else {
    localStorage.removeItem("tpm-auth-user");
  }
}

function clearAuthToken() {
  state.auth.token = null;
  state.auth.user = null;
  state.auth.mode = "guest";
  persistAuthState();
}

function toggleAuthPanelFocus() {
  if (state.mode !== "live") {
    connectBackend();
    return;
  }

  const field = elements.authPanel.querySelector("input");
  if (field) {
    field.focus();
    return;
  }

  document.getElementById("operations").scrollIntoView({ behavior: "smooth", block: "start" });
}

function getCartTotal() {
  return state.cart.reduce((acc, item) => acc + item.priceCents, 0);
}

function sumOrders() {
  return state.customerOrders.reduce((acc, order) => acc + order.totalCents, 0);
}

function setModeBadge(customLabel) {
  elements.modeLabel.textContent = customLabel || (state.mode === "live" ? "Backend conectado" : "Demo local");
  elements.statusDot.classList.toggle("live", state.mode === "live");
  elements.modeHelp.textContent = state.mode === "live"
    ? "A tela esta lendo catalogo e criando pedidos pelo backend local. O restante do fluxo ainda esta em construcao."
    : "Abrindo do arquivo local, a interface roda em demo e tenta conectar no backend quando ele estiver no ar.";
}

function statusClass(status) {
  if (status === "DELIVERED") return "status-delivered";
  if (status === "DELIVERY_FAILED") return "status-failed";
  return "status-pending";
}

function labelStatus(status) {
  const map = {
    PENDING: "Pendente",
    PAID: "Pago",
    DELIVERY_PENDING: "Entrega em fila",
    DELIVERED: "Entregue",
    DELIVERY_FAILED: "Falha"
  };
  return map[status] || status;
}

function customerStatusCopy(status) {
  const map = {
    PENDING: "Aguardando pagamento PIX.",
    PAID: "Pagamento confirmado. Entrega preparando.",
    DELIVERY_PENDING: "Pedido em fila de entrega.",
    DELIVERED: "Credenciais prontas para consulta.",
    DELIVERY_FAILED: "Entrega bloqueada e precisa de atencao."
  };
  return map[status] || status;
}

function humanizeProvider(provider) {
  const map = {
    NETFLIX: "Netflix",
    CRUNCHYROLL: "Crunchyroll",
    AMAZON_PRIME: "Amazon Prime",
    HULU: "Hulu",
    NBA: "NBA League Pass",
    PARAMOUNT_PLUS: "Paramount+",
    DISNEY_PLUS: "Disney+",
    YOUTUBE_PREMIUM: "YouTube Premium",
    CANVA: "Canva",
    FIGMA: "Figma",
    CHATGPT_PLUS: "ChatGPT Plus",
    ANTIGRAVITY: "Antigravity",
    LEAGUE_OF_LEGENDS: "League of Legends"
  };
  return map[provider] || provider;
}

function humanizeCategory(category) {
  const map = {
    STREAMING: "Streaming",
    ASSINATURA: "Assinaturas",
    GAMES: "Games"
  };
  return map[category] || category;
}

function humanizeRole(role) {
  const map = {
    CUSTOMER: "Cliente",
    ADMIN: "Admin"
  };
  return map[role] || role || "Conta";
}

function formatDuration(durationDays) {
  return durationDays > 0 ? `${durationDays} dias` : "sem vigencia fixa";
}

function formatCurrency(value) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(value / 100);
}

function formatDate(value) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short"
  }).format(new Date(value));
}

async function fetchJson(url, options = {}) {
  const headers = new Headers(options.headers || {});
  headers.set("X-Request-Id", crypto.randomUUID());

  if (state.auth.token && !options.skipAuth) {
    headers.set("Authorization", `Bearer ${state.auth.token}`);
  }

  const response = await fetch(url, {
    ...options,
    headers
  });

  if (!response.ok) {
    const error = new Error(`HTTP ${response.status}`);
    error.status = response.status;
    throw error;
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

function safeParse(value) {
  try {
    return JSON.parse(value);
  } catch (error) {
    return null;
  }
}

function createPosterArt(title, palette, width, height) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, palette[0]);
  gradient.addColorStop(0.5, palette[1]);
  gradient.addColorStop(1, palette[2]);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = "rgba(255,255,255,0.15)";
  ctx.beginPath();
  ctx.arc(width * 0.78, height * 0.24, width * 0.22, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "rgba(255,255,255,0.08)";
  ctx.fillRect(width * 0.08, height * 0.12, width * 0.24, height * 0.72);

  ctx.fillStyle = "#ffffff";
  ctx.font = `700 ${Math.floor(width * 0.085)}px Segoe UI`;
  ctx.textAlign = "left";
  const lines = wrapText(ctx, title.toUpperCase(), width * 0.62);
  lines.slice(0, 3).forEach((line, index) => {
    ctx.fillText(line, width * 0.08, height * 0.66 + index * (width * 0.1));
  });

  ctx.font = `600 ${Math.floor(width * 0.035)}px Segoe UI`;
  ctx.fillStyle = "rgba(255,255,255,0.84)";
  ctx.fillText("THE PIRATE MAX", width * 0.08, height * 0.14);

  return canvas.toDataURL("image/png");
}

function wrapText(ctx, text, maxWidth) {
  const words = text.split(" ");
  const lines = [];
  let currentLine = "";

  words.forEach((word) => {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    if (ctx.measureText(testLine).width > maxWidth) {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  });

  if (currentLine) lines.push(currentLine);
  return lines;
}
