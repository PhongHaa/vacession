import { api, toQuery } from './api';
import type { Category, Paginated, ProductDetail, ProductSummary, Settings, SortOption } from '@/types';

// Danh mục & settings ít thay đổi -> cache lại trong phiên
let categoriesCache: Promise<Category[]> | null = null;
let settingsCache: Promise<Settings> | null = null;

export const categoryService = {
  list: () => {
    categoriesCache ??= api.get<Category[]>('/categories').catch((e) => {
      categoriesCache = null;
      throw e;
    });
    return categoriesCache;
  },
  invalidate: () => { categoriesCache = null; },
};

export const settingsService = {
  get: () => {
    settingsCache ??= api.get<Settings>('/settings').catch((e) => {
      settingsCache = null;
      throw e;
    });
    return settingsCache;
  },
};

export interface ProductQuery {
  category?: string;
  new?: 'true';
  sort?: SortOption;
  q?: string;
  page?: number;
  limit?: number;
}

export const productService = {
  list: (q: ProductQuery = {}) => api.get<Paginated<ProductSummary>>(`/products${toQuery({ ...q })}`),
  get: (slug: string) => api.get<ProductDetail>(`/products/${encodeURIComponent(slug)}`),
};
