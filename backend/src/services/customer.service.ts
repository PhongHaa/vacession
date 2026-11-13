import type { Prisma } from '@prisma/client';
import { prisma } from '../config/prisma.js';
import { publicUserSelect } from './auth.service.js';

export async function adminListCustomers(q: { q?: string; page: number; limit: number }) {
  const where: Prisma.UserWhereInput = {
    role: 'CUSTOMER',
    ...(q.q && {
      OR: [
        { email: { contains: q.q, mode: 'insensitive' } },
        { firstName: { contains: q.q, mode: 'insensitive' } },
        { lastName: { contains: q.q, mode: 'insensitive' } },
        { phone: { contains: q.q } },
      ],
    }),
  };
  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: { ...publicUserSelect, orders: { select: { total: true, status: true, createdAt: true } } },
      orderBy: { createdAt: 'desc' },
      skip: (q.page - 1) * q.limit, take: q.limit,
    }),
    prisma.user.count({ where }),
  ]);

  const items = users.map(({ orders, ...user }) => {
    const valid = orders.filter((o) => o.status !== 'CANCELLED');
    const last = orders.reduce<Date | null>((max, o) => (!max || o.createdAt > max ? o.createdAt : max), null);
    return { ...user, orderCount: orders.length, spent: valid.reduce((sum, o) => sum + o.total, 0), lastOrderAt: last };
  });
  return { items, total, page: q.page, totalPages: Math.max(1, Math.ceil(total / q.limit)) };
}
