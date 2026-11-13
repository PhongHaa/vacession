import { api } from './api';

export interface ContactInput {
  name: string;
  email: string;
  phone?: string;
  message: string;
}

export const contactService = {
  send: (data: ContactInput) => api.post<{ message: string }>('/contact', data),
};
