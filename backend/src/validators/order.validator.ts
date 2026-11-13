import { z } from 'zod';
import { OrderStatus } from '@prisma/client';
import { emailSchema, phoneSchema, optionalText, paginationSchema } from './common.js';

const requiredText = (label: string, max: number) =>
  z.string({ required_error: `Vui lòng nhập ${label}` }).trim().min(1, `Vui lòng nhập ${label}`).max(max);

export const createOrderSchema = z.object({
  firstName: requiredText('tên', 50),
  lastName: requiredText('họ', 50),
  email: emailSchema,
  phone: phoneSchema,
  address: requiredText('địa chỉ', 255),
  city: requiredText('tỉnh/thành phố', 100),
  district: optionalText(100),
  note: optionalText(500),
  paymentMethod: z.enum(['COD', 'BANK_TRANSFER'], { errorMap: () => ({ message: 'Vui lòng chọn phương thức thanh toán' }) }),
  items: z.array(z.object({
    variantId: z.string().min(1),
    quantity: z.number().int().min(1).max(20),
  })).min(1, 'Giỏ hàng trống').max(50),
});
export type CreateOrderInput = z.infer<typeof createOrderSchema>;

export const updateOrderStatusSchema = z.object({ status: z.nativeEnum(OrderStatus) });

export const adminOrderQuerySchema = paginationSchema.extend({
  q: z.string().trim().optional(),
  status: z.nativeEnum(OrderStatus).optional(),
});
