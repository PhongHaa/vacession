import { z } from 'zod';
import { emailSchema, optionalText } from './common.js';

export const contactSchema = z.object({
  name: z.string().trim().min(1, 'Vui lòng nhập họ tên').max(100),
  email: emailSchema,
  phone: optionalText(20),
  message: z.string().trim().min(5, 'Nội dung tối thiểu 5 ký tự').max(2000),
});
