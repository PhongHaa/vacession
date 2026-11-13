import type { OrderStatus, Prisma } from '@prisma/client';
import { prisma } from '../config/prisma.js';
import { env } from '../config/env.js';
import { AppError } from '../utils/AppError.js';
import { generateOrderCode } from '../utils/orderCode.js';
import type { CreateOrderInput } from '../validators/order.validator.js';

type Tx = Prisma.TransactionClient;
const withItems = { items: true } as const;

export async function createOrder(input: CreateOrderInput, userId?: string) {
  // Gộp các dòng trùng variant
  const qtyByVariant = new Map<string, number>();
  for (const it of input.items) qtyByVariant.set(it.variantId, (qtyByVariant.get(it.variantId) ?? 0) + it.quantity);
  const variantIds = [...qtyByVariant.keys()];
  const { items: _, ...customer } = input;

  return prisma.$transaction(async (tx) => {
    const variants = await tx.productVariant.findMany({
      where: { id: { in: variantIds } }, include: { product: true },
    });
    if (variants.length !== variantIds.length) {
      throw new AppError('Một số sản phẩm không còn tồn tại, vui lòng kiểm tra lại giỏ hàng', 400);
    }

    let subtotal = 0;
    const items: Prisma.OrderItemCreateWithoutOrderInput[] = [];

    for (const v of variants) {
      const qty = qtyByVariant.get(v.id)!;
      if (!v.product.isActive) throw new AppError(`${v.product.name} đã ngừng bán`, 400);

      // Trừ kho có điều kiện -> an toàn khi nhiều người đặt cùng lúc
      const updated = await tx.productVariant.updateMany({
        where: { id: v.id, stock: { gte: qty } },
        data: { stock: { decrement: qty } },
      });
      if (updated.count === 0) {
        throw new AppError(
          v.stock > 0
            ? `${v.product.name} (size ${v.size}) chỉ còn ${v.stock} sản phẩm`
            : `${v.product.name} (size ${v.size}) đã hết hàng`,
          400,
        );
      }
      await tx.product.update({ where: { id: v.productId }, data: { soldCount: { increment: qty } } });

      subtotal += v.product.price * qty;
      items.push({
        product: { connect: { id: v.productId } },
        variant: { connect: { id: v.id } },
        productName: v.product.name,
        productSlug: v.product.slug,
        size: v.size,
        image: v.product.images[0] ?? null,
        price: v.product.price,
        quantity: qty,
      });
    }

    const shippingFee = env.shippingFee;
    return tx.order.create({
      data: {
        ...customer,
        code: generateOrderCode(),
        userId,
        subtotal,
        shippingFee,
        total: subtotal + shippingFee,
        items: { create: items },
      },
      include: withItems,
    });
  });
}

/** Khách xem đơn: phải là chủ đơn (đã đăng nhập) hoặc nhập đúng email đặt hàng */
export async function getOrderForCustomer(code: string, opts: { userId?: string; email?: string }) {
  const order = await prisma.order.findUnique({ where: { code }, include: withItems });
  const allowed = order && (
    (opts.userId && order.userId === opts.userId) ||
    (opts.email && order.email === opts.email.trim().toLowerCase())
  );
  if (!allowed) throw new AppError('Không tìm thấy đơn hàng', 404);
  return order;
}

export const listMyOrders = (userId: string) =>
  prisma.order.findMany({ where: { userId }, include: withItems, orderBy: { createdAt: 'desc' } });

async function restoreStock(tx: Tx, orderId: string) {
  const items = await tx.orderItem.findMany({ where: { orderId } });
  for (const it of items) {
    if (it.variantId) await tx.productVariant.update({ where: { id: it.variantId }, data: { stock: { increment: it.quantity } } });
    if (it.productId) await tx.product.update({ where: { id: it.productId }, data: { soldCount: { decrement: it.quantity } } });
  }
}

async function changeStatus(tx: Tx, orderId: string, current: OrderStatus, next: OrderStatus) {
  if (current === next) return;
  if (current === 'CANCELLED') throw new AppError('Đơn đã hủy, không thể đổi trạng thái', 400);
  if (next === 'CANCELLED') await restoreStock(tx, orderId);
  await tx.order.update({ where: { id: orderId }, data: { status: next } });
}

export async function cancelMyOrder(userId: string, code: string) {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findFirst({ where: { code, userId } });
    if (!order) throw new AppError('Không tìm thấy đơn hàng', 404);
    if (order.status !== 'PENDING') throw new AppError('Chỉ có thể hủy đơn đang chờ xác nhận', 400);
    await changeStatus(tx, order.id, order.status, 'CANCELLED');
    return tx.order.findUniqueOrThrow({ where: { id: order.id }, include: withItems });
  });
}

// ---------- Admin ----------
export async function adminListOrders(q: { q?: string; status?: OrderStatus; page: number; limit: number }) {
  const where: Prisma.OrderWhereInput = {
    ...(q.status && { status: q.status }),
    ...(q.q && {
      OR: [
        { code: { contains: q.q, mode: 'insensitive' } },
        { email: { contains: q.q, mode: 'insensitive' } },
        { phone: { contains: q.q } },
        { firstName: { contains: q.q, mode: 'insensitive' } },
        { lastName: { contains: q.q, mode: 'insensitive' } },
      ],
    }),
  };
  const [items, total] = await Promise.all([
    prisma.order.findMany({
      where, include: { _count: { select: { items: true } } },
      orderBy: { createdAt: 'desc' }, skip: (q.page - 1) * q.limit, take: q.limit,
    }),
    prisma.order.count({ where }),
  ]);
  return { items, total, page: q.page, totalPages: Math.max(1, Math.ceil(total / q.limit)) };
}

export async function adminGetOrder(id: string) {
  const order = await prisma.order.findUnique({
    where: { id }, include: { ...withItems, user: { select: { id: true, email: true } } },
  });
  if (!order) throw new AppError('Không tìm thấy đơn hàng', 404);
  return order;
}

export async function adminUpdateStatus(id: string, status: OrderStatus) {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({ where: { id } });
    if (!order) throw new AppError('Không tìm thấy đơn hàng', 404);
    await changeStatus(tx, id, order.status, status);
    return tx.order.findUniqueOrThrow({ where: { id }, include: withItems });
  });
}

const dayKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const LOW_STOCK = 3;
const lowStockWhere = { stock: { lte: LOW_STOCK }, product: { isActive: true } } satisfies Prisma.ProductVariantWhereInput;

/** Số liệu cho trang tổng quan admin */
export async function adminStats() {
  const DAYS = 14;
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - (DAYS - 1));
  const prevStart = new Date(start);
  prevStart.setDate(prevStart.getDate() - DAYS);
  const notCancelled = { status: { not: 'CANCELLED' } } as const;

  const [revenueAll, totalProducts, totalCustomers, unreadMessages, recentOrders, periodOrders, prevRevenue,
    statusGroups, topItems, lowStock, lowStockCount] = await Promise.all([
    prisma.order.aggregate({ _sum: { total: true }, where: notCancelled }),
    prisma.product.count({ where: { isActive: true } }),
    prisma.user.count({ where: { role: 'CUSTOMER' } }),
    prisma.contactMessage.count({ where: { isRead: false } }),
    prisma.order.findMany({ orderBy: { createdAt: 'desc' }, take: 6 }),
    prisma.order.findMany({ where: { createdAt: { gte: start }, ...notCancelled }, select: { createdAt: true, total: true } }),
    prisma.order.aggregate({ _sum: { total: true }, where: { createdAt: { gte: prevStart, lt: start }, ...notCancelled } }),
    prisma.order.groupBy({ by: ['status'], _count: { _all: true } }),
    prisma.orderItem.groupBy({
      by: ['productId', 'productName'],
      where: { order: notCancelled },
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 5,
    }),
    prisma.productVariant.findMany({
      where: lowStockWhere,
      include: { product: { select: { id: true, name: true, images: true } } },
      orderBy: [{ stock: 'asc' }, { id: 'asc' }],
      take: 6,
    }),
    prisma.productVariant.count({ where: lowStockWhere }),
  ]);

  // Doanh thu & số đơn theo từng ngày (ngày không có đơn vẫn hiện = 0)
  const daily = Array.from({ length: DAYS }, (_, i) => {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    return { date: dayKey(d), revenue: 0, orders: 0 };
  });
  const byDate = new Map(daily.map((d) => [d.date, d]));
  for (const o of periodOrders) {
    const day = byDate.get(dayKey(o.createdAt));
    if (day) { day.revenue += o.total; day.orders += 1; }
  }

  const statusCounts: Record<OrderStatus, number> = { PENDING: 0, CONFIRMED: 0, SHIPPING: 0, COMPLETED: 0, CANCELLED: 0 };
  for (const g of statusGroups) statusCounts[g.status] = g._count._all;

  const topIds = topItems.map((t) => t.productId).filter((id): id is string => !!id);
  const topImages = new Map(
    (await prisma.product.findMany({ where: { id: { in: topIds } }, select: { id: true, images: true } }))
      .map((p) => [p.id, p.images[0] ?? null]),
  );

  return {
    totalOrders: Object.values(statusCounts).reduce((a, b) => a + b, 0),
    pendingOrders: statusCounts.PENDING,
    revenue: revenueAll._sum.total ?? 0,
    totalProducts, totalCustomers, unreadMessages, recentOrders,
    daily,
    periodRevenue: daily.reduce((sum, d) => sum + d.revenue, 0),
    prevPeriodRevenue: prevRevenue._sum.total ?? 0,
    statusCounts,
    topProducts: topItems.map((t) => ({
      productId: t.productId, name: t.productName, quantity: t._sum.quantity ?? 0,
      image: t.productId ? topImages.get(t.productId) ?? null : null,
    })),
    lowStock: lowStock.map((v) => ({
      variantId: v.id, productId: v.product.id, name: v.product.name, image: v.product.images[0] ?? null, size: v.size, stock: v.stock,
    })),
    lowStockCount,
  };
}
