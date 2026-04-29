export function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(value / 100);
}

export function formatDate(value?: string | null) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short"
  }).format(new Date(value));
}

export function humanizeCategory(category: string) {
  const map: Record<string, string> = {
    STREAMING: "Streaming",
    ASSINATURA: "Assinaturas",
    GAMES: "Games"
  };
  return map[category] || category;
}

export function humanizeRole(role?: string) {
  const map: Record<string, string> = {
    CUSTOMER: "Cliente",
    ADMIN: "Admin"
  };
  return map[role || ""] || role || "Conta";
}

export function labelStatus(status: string) {
  const map: Record<string, string> = {
    PENDING: "Pendente",
    PAID: "Pago",
    DELIVERY_PENDING: "Em entrega",
    DELIVERED: "Entregue",
    DELIVERY_FAILED: "Falhou",
    CANCELED: "Cancelado"
  };
  return map[status] || status;
}

export function statusTone(status: string) {
  if (status === "DELIVERED") return "success";
  if (status === "PAID" || status === "DELIVERY_PENDING") return "info";
  if (status === "CANCELED" || status === "DELIVERY_FAILED") return "danger";
  return "warning";
}
