import { api } from './api';
import type { User } from '@/types';

export type ProfileInput = Partial<Pick<User, 'firstName' | 'lastName' | 'phone' | 'address' | 'city'>>;

export const accountService = {
  updateProfile: (data: ProfileInput) => api.put<{ user: User }>('/account/profile', data),
  changePassword: (currentPassword: string, newPassword: string) =>
    api.put<{ message: string }>('/account/password', { currentPassword, newPassword }),
};
