export type ProductCategory = "STREAMING" | "ASSINATURA" | "GAMES";

export interface Product {
  id: string;
  sku: string;
  slug: string;
  name: string;
  description: string;
  category: ProductCategory;
  provider: string;
  priceCents: number;
  currency: string;
  regionCode: string;
  durationDays: number;
  fulfillmentNotes: string;
  requiresStock: boolean;
  availableStock?: number;
}

export interface AdminProduct extends Product {
  status: "ACTIVE" | "INACTIVE" | "ARCHIVED";
  deliveryType: string;
}

export interface InventoryItem {
  sku: string;
  slug: string;
  name: string;
  provider: string;
  priceCents: number;
  availableStock: number;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: "CUSTOMER" | "ADMIN";
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPriceCents: number;
  totalPriceCents: number;
}

export interface OrderSummary {
  id: string;
}

export interface AdminOrderSummary {
  orderId: string;
  externalReference?: string | null;
  status: string;
  paymentMethod: string;
  totalCents: number;
  currency: string;
  createdAt: string;
  paidAt?: string | null;
  deliveredAt?: string | null;
  canceledAt?: string | null;
  failureReason?: string | null;
  customer: {
    userId: string;
    name: string;
    email: string;
  };
  items: {
    productId: string;
    productSku: string;
    productName: string;
    quantity: number;
  }[];
}

export interface OrderDetail {
  id: string;
  status: string;
  paymentMethod: string;
  totalCents: number;
  currency: string;
  createdAt: string;
  paidAt?: string | null;
  deliveredAt?: string | null;
  canceledAt?: string | null;
  failureReason?: string | null;
  externalReference?: string | null;
  payment?: {
    provider: string;
    providerStatus?: string | null;
    providerPaymentId?: string | null;
    qrCode?: string | null;
    copyPaste?: string | null;
    pixExpiresAt?: string | null;
  } | null;
  items: OrderItem[];
}

export interface DeliveredCredential {
  orderItemId: string;
  productName: string;
  login: string;
  password: string;
}

export interface DeliveredCredentialsResponse {
  orderId: string;
  credentials: DeliveredCredential[];
}

export interface CreateOrderResponse {
  order: {
    id: string;
    status: string;
    totalCents: number;
    createdAt: string;
    externalReference?: string | null;
  };
  payment: {
    qrCode?: string | null;
    copyPaste: string;
    expiresAt?: string | null;
  };
}

export interface OrderStatusResponse {
  orderId: string;
  status: string;
  failureReason?: string | null;
  paidAt?: string | null;
  deliveredAt?: string | null;
}

export interface AdminOrderDiagnostics {
  orderId: string;
  externalReference: string;
  orderStatus: string;
  failureReason?: string | null;
  paymentMethod: string;
  totalCents: number;
  currency: string;
  createdAt: string;
  paidAt?: string | null;
  deliveredAt?: string | null;
  canceledAt?: string | null;
  payment?: {
    provider: string;
    providerStatus?: string | null;
    providerPaymentId?: string | null;
    amountCents: number;
    paidAt?: string | null;
    pixExpiresAt?: string | null;
  } | null;
  items: {
    orderItemId: string;
    productId: string;
    productSku: string;
    productName: string;
    credentialId?: string | null;
    credentialStatus?: string | null;
    sourceBatch?: string | null;
    reservedAt?: string | null;
    deliveredAt?: string | null;
  }[];
}

export interface AdminCredentialResponse {
  credentialId: string;
  productId: string;
  productSku: string;
  productName: string;
  status: string;
  loginHint: string;
  sourceBatch?: string | null;
  createdAt?: string | null;
  reservedAt?: string | null;
  deliveredAt?: string | null;
  invalidatedAt?: string | null;
  invalidationReason?: string | null;
}

export interface AdminCredentialSecretResponse {
  credentialId: string;
  login: string;
  password: string;
}
