import { z } from 'zod';
import { emailSchema, passwordSchema, optionalText } from './common.js';

export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  firstName: optionalText(50),
  lastName: optionalText(50),
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Vui lòng nhập mật khẩu'),
  remember: z.boolean().optional().default(false),
});

export const forgotPasswordSchema = z.object({ email: emailSchema });

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Link không hợp lệ'),
  password: passwordSchema,
});
