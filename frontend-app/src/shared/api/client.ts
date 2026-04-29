import type {
  AuthResponse,
  AuthUser,
  CreateOrderResponse,
  DeliveredCredentialsResponse,
  InventoryItem,
  OrderDetail,
  OrderSummary,
  Product
} from "../types";

const API_BASE_KEY = "tpm-app-api-base";
const TOKEN_KEY = "tpm-app-auth-token";

export function getStoredApiBase() {
  return localStorage.getItem(API_BASE_KEY) || "http://localhost:8080";
}

export function storeApiBase(value: string) {
  localStorage.setItem(API_BASE_KEY, value);
}

export function getStoredToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function storeToken(token: string | null) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

async function request<T>(path: string, options: RequestInit & { apiBase?: string; token?: string | null } = {}) {
  const headers = new Headers(options.headers || {});
  headers.set("X-Request-Id", crypto.randomUUID());
  if (options.token) {
    headers.set("Authorization", `Bearer ${options.token}`);
  }

  const response = await fetch(`${options.apiBase || getStoredApiBase()}${path}`, {
    ...options,
    headers
  });

  if (!response.ok) {
    let message = `HTTP ${response.status}`;
    try {
      const payload = await response.json() as { message?: string; code?: string };
      if (payload?.message) {
        message = payload.message;
      } else if (payload?.code) {
        message = payload.code;
      }
    } catch {
      // ignore non-json error bodies
    }

    const error = new Error(message) as Error & { status?: number };
    error.status = response.status;
    throw error;
  }

  if (response.status === 204) {
    return null as T;
  }

  return response.json() as Promise<T>;
}

export const apiClient = {
  getHealth(apiBase?: string) {
    return request<{ status: string }>("/actuator/health", { apiBase });
  },
  getProducts(apiBase?: string) {
    return request<Product[]>("/api/products", { apiBase });
  },
  getInventory(apiBase?: string) {
    return request<InventoryItem[]>("/api/products/inventory", { apiBase });
  },
  getMe(apiBase?: string, token?: string | null) {
    return request<AuthUser>("/api/auth/me", { apiBase, token });
  },
  login(payload: { email: string; password: string }, apiBase?: string) {
    return request<AuthResponse>("/api/auth/login", {
      apiBase,
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
  },
  register(payload: { name: string; email: string; password: string }, apiBase?: string) {
    return request<AuthResponse>("/api/auth/register", {
      apiBase,
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
  },
  getOrders(apiBase?: string, token?: string | null) {
    return request<OrderSummary[]>("/api/orders", { apiBase, token });
  },
  getOrder(orderId: string, apiBase?: string, token?: string | null) {
    return request<OrderDetail>(`/api/orders/${orderId}`, { apiBase, token });
  },
  getOrderCredentials(orderId: string, apiBase?: string, token?: string | null) {
    return request<DeliveredCredentialsResponse>(`/api/orders/${orderId}/credentials`, { apiBase, token });
  },
  createOrder(payload: { items: { productId: string; quantity: number }[]; paymentMethod: "PIX" }, apiBase?: string, token?: string | null) {
    return request<CreateOrderResponse>("/api/orders", {
      apiBase,
      token,
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
  },
  simulatePayment(externalReference: string, apiBase?: string) {
    return request<{ message: string }>("/api/webhooks/mercadopago", {
      apiBase,
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "payment.updated",
        data: {
          id: `dev-${Date.now()}`,
          status: "approved",
          external_reference: externalReference
        }
      })
    });
  }
};
