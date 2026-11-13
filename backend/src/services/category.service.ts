import { prisma } from '../config/prisma.js';
import { AppError } from '../utils/AppError.js';
import { uniqueSlug } from '../utils/slugify.js';
import type { CategoryInput } from '../validators/product.validator.js';

export const listCategories = () =>
  prisma.category.findMany({
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    include: { _count: { select: { products: { where: { isActive: true } } } } },
  });

const slugTaken = (excludeId?: string) => async (slug: string) =>
  !!(await prisma.category.findFirst({ where: { slug, NOT: excludeId ? { id: excludeId } : undefined } }));

export async function createCategory(input: CategoryInput) {
  const slug = input.slug ?? (await uniqueSlug(input.name, slugTaken()));
  return prisma.category.create({ data: { name: input.name, slug, sortOrder: input.sortOrder } });
}

export async function updateCategory(id: string, input: CategoryInput) {
  const slug = input.slug ?? (await uniqueSlug(input.name, slugTaken(id)));
  return prisma.category.update({ where: { id }, data: { name: input.name, slug, sortOrder: input.sortOrder } });
}

export async function deleteCategory(id: string) {
  const count = await prisma.product.count({ where: { categoryId: id } });
  if (count > 0) throw new AppError(`Danh mục đang có ${count} sản phẩm, không thể xóa`, 400);
  await prisma.category.delete({ where: { id } });
}
