import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import multer from 'multer';
import { Prisma } from '@prisma/client';
import { AppError } from '../utils/AppError.js';

export const notFound = (req: Request, _res: Response, next: NextFunction) => {
  next(new AppError(`Không tìm thấy: ${req.method} ${req.originalUrl}`, 404));
};

export const errorHandler = (err: Error, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ message: err.message });
  }
  if (err instanceof ZodError) {
    return res.status(400).json({ message: err.issues[0]?.message ?? 'Dữ liệu không hợp lệ', issues: err.issues });
  }
  if (err instanceof multer.MulterError) {
    const message = err.code === 'LIMIT_FILE_SIZE' ? 'Ảnh tối đa 5MB' : err.message;
    return res.status(400).json({ message });
  }
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') return res.status(409).json({ message: 'Dữ liệu đã tồn tại (trùng slug hoặc email)' });
    if (err.code === 'P2025') return res.status(404).json({ message: 'Không tìm thấy dữ liệu' });
  }
  if (err instanceof SyntaxError && 'body' in err) {
    return res.status(400).json({ message: 'JSON không hợp lệ' });
  }
  console.error(err);
  res.status(500).json({ message: 'Lỗi máy chủ, vui lòng thử lại sau' });
};
