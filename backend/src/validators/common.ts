import { z } from 'zod';

export const emailSchema = z.string({ required_error: 'Vui lòng nhập email' })
  .trim().toLowerCase().email('Email không hợp lệ');

export const passwordSchema = z.string({ required_error: 'Vui lòng nhập mật khẩu' })
  .min(6, 'Mật khẩu tối thiểu 6 ký tự').max(100);

export const phoneSchema = z.string({ required_error: 'Vui lòng nhập số điện thoại' })
  .trim().regex(/^(0|\+84)\d{9,10}$/, 'Số điện thoại không hợp lệ');

export const optionalText = (max: number) =>
  z.string().trim().max(max).optional().transform((v) => (v ? v : undefined));

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
