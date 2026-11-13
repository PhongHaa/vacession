import { api } from './api';
import type { User } from '@/types';

export const authService = {
  me: () => api.get<{ user: User | null }>('/auth/me'),
  login: (email: string, password: string, remember: boolean) =>
    api.post<{ user: User }>('/auth/login', { email, password, remember }),
  register: (data: { email: string; password: string }) => api.post<{ user: User }>('/auth/register', data),
  logout: () => api.post('/auth/logout'),
  forgotPassword: (email: string) => api.post<{ message: string }>('/auth/forgot-password', { email }),
  resetPassword: (token: string, password: string) =>
    api.post<{ message: string }>('/auth/reset-password', { token, password }),
};
