import type { Request, Response } from 'express';
import * as orderService from '../services/order.service.js';
import { env } from '../config/env.js';
import { adminOrderQuerySchema } from '../validators/order.validator.js';

export async function create(req: Request, res: Response) {
  res.status(201).json(await orderService.createOrder(req.body, req.user?.id));
}

export async function getByCode(req: Request<{ code: string }>, res: Response) {
  const email = typeof req.query.email === 'string' ? req.query.email : undefined;
  const order = await orderService.getOrderForCustomer(req.params.code, { userId: req.user?.id, email });
  res.json({ ...order, bank: order.paymentMethod === 'BANK_TRANSFER' ? env.bank : undefined });
}

export async function myOrders(req: Request, res: Response) {
  res.json(await orderService.listMyOrders(req.user!.id));
}

export async function cancelMine(req: Request<{ code: string }>, res: Response) {
  res.json(await orderService.cancelMyOrder(req.user!.id, req.params.code));
}

// ---------- Admin ----------
export async function adminList(req: Request, res: Response) {
  res.json(await orderService.adminListOrders(adminOrderQuerySchema.parse(req.query)));
}

export async function adminDetail(req: Request<{ id: string }>, res: Response) {
  res.json(await orderService.adminGetOrder(req.params.id));
}

export async function adminUpdateStatus(req: Request<{ id: string }>, res: Response) {
  res.json(await orderService.adminUpdateStatus(req.params.id, req.body.status));
}

export async function adminStats(_req: Request, res: Response) {
  res.json(await orderService.adminStats());
}
