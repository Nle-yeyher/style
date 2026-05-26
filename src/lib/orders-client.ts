// lib/orders-client.ts
// Cliente para el microservicio de Órdenes & Pagos
// Úsalo desde tus Server Actions o Route Handlers de Next.js

const BASE_URL = process.env.NEXT_PUBLIC_ORDERS_API_URL ?? "http://localhost:8001";

// ─── Tipos ────────────────────────────────────────────────────────────────────

export type OrderStatus = "pending" | "paid" | "failed" | "refunded" | "cancelled";

export interface OrderItem {
  product_id: string;
  name: string;
  quantity: number;
  unit_price: number;
}

export interface Order {
  id: string;
  customer_id: string;
  items: OrderItem[];
  total: number;
  currency: string;
  status: OrderStatus;
  created_at: string;
  updated_at: string;
  payment_id?: string;
  notes?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(error.detail ?? "Orders service error");
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

// ─── Órdenes ──────────────────────────────────────────────────────────────────

export const ordersClient = {
  /** Crea una nueva orden */
  create: (data: {
    customer_id: string;
    items: OrderItem[];
    currency?: string;
  }) =>
    apiFetch<Order>("/orders/", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  /** Lista órdenes (todas o filtradas por cliente) */
  list: (customer_id?: string) => {
    const qs = customer_id ? `?customer_id=${customer_id}` : "";
    return apiFetch<Order[]>(`/orders/${qs}`);
  },

  /** Obtiene una orden por ID */
  get: (order_id: string) => apiFetch<Order>(`/orders/${order_id}`),

  /** Cancela una orden pendiente */
  cancel: (order_id: string) =>
    apiFetch<Order>(`/orders/${order_id}/cancel`, { method: "PATCH" }),

  /** Elimina una orden */
  delete: (order_id: string) =>
    apiFetch<void>(`/orders/${order_id}`, { method: "DELETE" }),
};

// ─── Pagos ────────────────────────────────────────────────────────────────────

export const paymentsClient = {
  /**
   * Procesa el pago de una orden.
   * Usa payment_token = "fail_xxx" para simular un pago rechazado en desarrollo.
   */
  pay: (data: {
    order_id: string;
    payment_method: string;
    payment_token: string;
  }) =>
    apiFetch<Order>("/payments/pay", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  /** Reembolsa una orden pagada */
  refund: (order_id: string) =>
    apiFetch<Order>(`/payments/refund/${order_id}`, { method: "POST" }),
};
