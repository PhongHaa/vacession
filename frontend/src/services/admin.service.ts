import { api, toQuery } from './api';
import type {
  AdminCustomer, AdminOrderRow, AdminProduct, AdminStats, Category, ContactMessage, Order, OrderStatus, Paginated, ProductInput,
} from '@/types';

export const adminService = {
  stats: () => api.get<AdminStats>('/admin/stats'),

  customers: (q: { q?: string; page?: number }) => api.get<Paginated<AdminCustomer>>(`/admin/customers${toQuery(q)}`),

  products: (q: { q?: string; category?: string; stock?: string; page?: number }) =>
    api.get<Paginated<AdminProduct>>(`/admin/products${toQuery(q)}`),
  product: (id: string) => api.get<AdminProduct>(`/admin/products/${id}`),
  createProduct: (data: ProductInput) => api.post<AdminProduct>('/admin/products', data),
  updateProduct: (id: string, data: ProductInput) => api.put<AdminProduct>(`/admin/products/${id}`, data),
  deleteProduct: (id: string) => api.delete(`/admin/products/${id}`),

  createCategory: (data: { name: string; slug?: string; sortOrder: number }) => api.post<Category>('/admin/categories', data),
  updateCategory: (id: string, data: { name: string; slug?: string; sortOrder: number }) =>
    api.put<Category>(`/admin/categories/${id}`, data),
  deleteCategory: (id: string) => api.delete(`/admin/categories/${id}`),

  orders: (q: { q?: string; status?: OrderStatus | ''; page?: number }) =>
    api.get<Paginated<AdminOrderRow>>(`/admin/orders${toQuery(q)}`),
  order: (id: string) => api.get<Order>(`/admin/orders/${id}`),
  updateOrderStatus: (id: string, status: OrderStatus) => api.patch<Order>(`/admin/orders/${id}/status`, { status }),

  messages: () => api.get<ContactMessage[]>('/admin/messages'),
  markMessageRead: (id: string) => api.patch<ContactMessage>(`/admin/messages/${id}/read`),

  upload: (files: FileList | File[]) => {
    const form = new FormData();
    Array.from(files).forEach((f) => form.append('images', f));
    return api.upload<{ urls: string[] }>('/admin/upload', form);
  },
};
