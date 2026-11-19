import { apiRequest } from './client';

export type Order = {
  id: number;
  reference: string;
  status: 'pending' | 'paid' | 'rejected';
  amount: string;
  amount_label: string;
  failure_reason: string | null;
  paid_at: string | null;
  course: { slug: string; title: string };
};

/** Crea el pedido y devuelve la URL firmada del formulario de Izipay. */
export async function createOrder(courseSlug: string) {
  const response = await apiRequest<{ data: Order; payment_url: string }>(
    `/courses/${encodeURIComponent(courseSlug)}/orders`,
    { method: 'POST' },
  );
  return { order: response.data, paymentUrl: response.payment_url };
}

export async function fetchOrder(id: number) {
  const { data } = await apiRequest<{ data: Order }>(`/orders/${id}`);
  return data;
}
