import type { Request, Response } from 'express';
import { env } from '../config/env.js';

/** Thông tin công khai của shop dùng cho FE (phí ship, liên hệ) */
export function getSettings(_req: Request, res: Response) {
  res.json({ shippingFee: env.shippingFee, shop: env.shop });
}
