import { api, toQuery } from './api';
import type { CheckoutInput, Order } from '@/types';

export const orderService = {
  create: (data: CheckoutInput) => api.post<Order>('/orders', data),
  get: (code: string, email?: string) => api.get<Order>(`/orders/${encodeURIComponent(code)}${toQuery({ email })}`),
  myOrders: () => api.get<Order[]>('/orders/my'),
  cancel: (code: string) => api.post<Order>(`/orders/my/${encodeURIComponent(code)}/cancel`),
};
