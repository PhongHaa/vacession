import type { Request, Response } from 'express';
import { AppError } from '../utils/AppError.js';

export function uploadImages(req: Request, res: Response) {
  const files = (req.files as Express.Multer.File[] | undefined) ?? [];
  if (files.length === 0) throw new AppError('Chưa chọn ảnh', 400);
  res.status(201).json({ urls: files.map((f) => `/uploads/${f.filename}`) });
}
