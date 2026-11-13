// Lớp gọi API dùng chung — mọi service đều đi qua đây
import { ApiError } from './apiError';
import { IS_DEMO } from '@/constants';

const BASE_URL = import.meta.env.VITE_API_URL ?? '/api';

export { ApiError };

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  // Bản demo (GitHub Pages): không có server, mọi request được giả lập trong trình duyệt.
  // Tải lười để bản build thật không chứa code giả lập.
  if (IS_DEMO) {
    const { handleDemoRequest } = await import('@/demo/server');
    return handleDemoRequest(options.method ?? 'GET', path, options.body) as Promise<T>;
  }
  const isForm = options.body instanceof FormData;
  const res = await fetch(`${BASE_URL}${path}`, {
    credentials: 'include',
    ...options,
    headers: { ...(isForm ? {} : { 'Content-Type': 'application/json' }), ...options.headers },
  });
  if (res.status === 204) return undefined as T;
  const body = await res.json().catch(() => null);
  if (!res.ok) throw new ApiError(body?.message ?? `Lỗi ${res.status}`, res.status);
  return body as T;
}

const json = (data: unknown) => (data === undefined ? undefined : JSON.stringify(data));

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, data?: unknown) => request<T>(path, { method: 'POST', body: json(data) }),
  put: <T>(path: string, data?: unknown) => request<T>(path, { method: 'PUT', body: json(data) }),
  patch: <T>(path: string, data?: unknown) => request<T>(path, { method: 'PATCH', body: json(data) }),
  delete: <T = void>(path: string) => request<T>(path, { method: 'DELETE' }),
  upload: <T>(path: string, form: FormData) => request<T>(path, { method: 'POST', body: form }),
};

/** { a: 1, b: undefined } -> "?a=1" */
export function toQuery(params: Record<string, string | number | undefined | null>) {
  const search = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== '') search.set(k, String(v));
  }
  const q = search.toString();
  return q ? `?${q}` : '';
}
