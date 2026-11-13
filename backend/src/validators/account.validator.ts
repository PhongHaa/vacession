import { z } from 'zod';
import { optionalText, passwordSchema } from './common.js';

export const updateProfileSchema = z.object({
  firstName: optionalText(50),
  lastName: optionalText(50),
  phone: optionalText(20),
  address: optionalText(255),
  city: optionalText(100),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Vui lòng nhập mật khẩu hiện tại'),
  newPassword: passwordSchema,
});
