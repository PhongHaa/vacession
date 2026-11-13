import { z } from 'zod';
import { paginationSchema } from './common.js';

export const SORT_OPTIONS = ['default', 'popularity', 'newest', 'price', 'price-desc'] as const;

export const productQuerySchema = paginationSchema.extend({
  category: z.string().trim().optional(),
  sort: z.enum(SORT_OPTIONS).catch('default'),
  new: z.enum(['true', 'false']).optional(),
  q: z.string().trim().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(48),
});
export type ProductQuery = z.infer<typeof productQuerySchema>;

const slugSchema = z.string().trim().toLowerCase()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug chỉ gồm chữ thường, số và dấu gạch ngang');

export const productInputSchema = z.object({
  name: z.string().trim().min(1, 'Vui lòng nhập tên sản phẩm').max(200),
  slug: slugSchema.optional().or(z.literal('').transform(() => undefined)),
  description: z.string().max(10000).default(''),
  price: z.number({ invalid_type_error: 'Giá không hợp lệ' }).int().min(0),
  images: z.array(z.string().min(1)).max(10).default([]),
  sizeChart: z.string().nullable().optional(),
  categoryId: z.string().min(1, 'Vui lòng chọn danh mục'),
  isActive: z.boolean().default(true),
  isNew: z.boolean().default(false),
  sortOrder: z.number().int().default(0),
  variants: z.array(z.object({
    size: z.string().trim().min(1).max(20),
    stock: z.number().int().min(0),
  })).min(1, 'Cần ít nhất 1 size')
    .refine((v) => new Set(v.map((x) => x.size.toUpperCase())).size === v.length, 'Size bị trùng'),
});
export type ProductInput = z.infer<typeof productInputSchema>;

export const adminProductQuerySchema = paginationSchema.extend({
  q: z.string().trim().optional(),
  category: z.string().optional(),
  stock: z.enum(['low', 'out']).optional(),
});

export const categoryInputSchema = z.object({
  name: z.string().trim().min(1, 'Vui lòng nhập tên danh mục').max(100),
  slug: slugSchema.optional().or(z.literal('').transform(() => undefined)),
  sortOrder: z.number().int().default(0),
});
export type CategoryInput = z.infer<typeof categoryInputSchema>;
