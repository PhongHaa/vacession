import type { Prisma } from '@prisma/client';
import { prisma } from '../config/prisma.js';
import { AppError } from '../utils/AppError.js';
import { uniqueSlug } from '../utils/slugify.js';
import type { ProductInput, ProductQuery } from '../validators/product.validator.js';

const SORT_MAP: Record<ProductQuery['sort'], Prisma.ProductOrderByWithRelationInput[]> = {
  default: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
  popularity: [{ soldCount: 'desc' }, { createdAt: 'desc' }],
  newest: [{ createdAt: 'desc' }],
  price: [{ price: 'asc' }],
  'price-desc': [{ price: 'desc' }],
};

const cardSelect = {
  id: true, name: true, slug: true, price: true, images: true, isNew: true,
  category: { select: { name: true, slug: true } },
  variants: { select: { id: true, size: true, stock: true }, orderBy: { id: 'asc' } },
} satisfies Prisma.ProductSelect;

// ---------- Public ----------
export async function listProducts(q: ProductQuery) {
  const where: Prisma.ProductWhereInput = {
    isActive: true,
    ...(q.category && { category: { slug: q.category } }),
    ...(q.new === 'true' && { isNew: true }),
    ...(q.q && { name: { contains: q.q, mode: 'insensitive' } }),
  };
  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where, select: cardSelect, orderBy: SORT_MAP[q.sort],
      skip: (q.page - 1) * q.limit, take: q.limit,
    }),
    prisma.product.count({ where }),
  ]);
  return { items, total, page: q.page, totalPages: Math.max(1, Math.ceil(total / q.limit)) };
}

export async function getProductBySlug(slug: string) {
  const product = await prisma.product.findFirst({
    where: { slug, isActive: true },
    select: { ...cardSelect, description: true, sizeChart: true, categoryId: true },
  });
  if (!product) throw new AppError('Không tìm thấy sản phẩm', 404);

  const related = await prisma.product.findMany({
    where: { isActive: true, categoryId: product.categoryId, NOT: { id: product.id } },
    select: cardSelect, orderBy: { soldCount: 'desc' }, take: 4,
  });
  return { ...product, related };
}

// ---------- Admin ----------
export async function adminListProducts(q: { q?: string; category?: string; stock?: 'low' | 'out'; page: number; limit: number }) {
  const where: Prisma.ProductWhereInput = {
    ...(q.q && { name: { contains: q.q, mode: 'insensitive' } }),
    ...(q.category && { categoryId: q.category }),
    // low: có size còn <= 3 sản phẩm; out: mọi size đều hết
    ...(q.stock === 'low' && { variants: { some: { stock: { lte: 3 } } } }),
    ...(q.stock === 'out' && { variants: { every: { stock: { lte: 0 } } } }),
  };
  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { category: { select: { name: true } }, variants: true },
      orderBy: { createdAt: 'desc' },
      skip: (q.page - 1) * q.limit, take: q.limit,
    }),
    prisma.product.count({ where }),
  ]);
  return { items, total, page: q.page, totalPages: Math.max(1, Math.ceil(total / q.limit)) };
}

export async function adminGetProduct(id: string) {
  const product = await prisma.product.findUnique({
    where: { id }, include: { variants: { orderBy: { id: 'asc' } } },
  });
  if (!product) throw new AppError('Không tìm thấy sản phẩm', 404);
  return product;
}

const slugTaken = (excludeId?: string) => async (slug: string) =>
  !!(await prisma.product.findFirst({ where: { slug, NOT: excludeId ? { id: excludeId } : undefined } }));

export async function createProduct(input: ProductInput) {
  const { variants, slug, ...data } = input;
  return prisma.product.create({
    data: {
      ...data,
      slug: slug ?? (await uniqueSlug(input.name, slugTaken())),
      variants: { create: variants },
    },
    include: { variants: true },
  });
}

export async function updateProduct(id: string, input: ProductInput) {
  const { variants, slug, ...data } = input;
  const finalSlug = slug ?? (await uniqueSlug(input.name, slugTaken(id)));

  return prisma.$transaction(async (tx) => {
    await tx.product.update({ where: { id }, data: { ...data, slug: finalSlug } });
    // Xóa size không còn, cập nhật/tạo size còn lại
    await tx.productVariant.deleteMany({ where: { productId: id, size: { notIn: variants.map((v) => v.size) } } });
    for (const v of variants) {
      await tx.productVariant.upsert({
        where: { productId_size: { productId: id, size: v.size } },
        create: { productId: id, size: v.size, stock: v.stock },
        update: { stock: v.stock },
      });
    }
    return tx.product.findUniqueOrThrow({ where: { id }, include: { variants: true } });
  });
}

export const deleteProduct = (id: string) => prisma.product.delete({ where: { id } });
