import type { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt.js';
import { AppError } from '../utils/AppError.js';

export const AUTH_COOKIE = 'token';

/** Đọc cookie, nếu hợp lệ thì gắn req.user. Không bắt buộc đăng nhập. */
export const loadUser = (req: Request, _res: Response, next: NextFunction) => {
  const token = req.cookies?.[AUTH_COOKIE];
  if (token) {
    try {
      const payload = verifyToken(token);
      req.user = { id: payload.sub, role: payload.role };
    } catch {
      // token hết hạn / sai -> coi như chưa đăng nhập
    }
  }
  next();
};

export const requireAuth = (req: Request, _res: Response, next: NextFunction) => {
  if (!req.user) throw new AppError('Vui lòng đăng nhập', 401);
  next();
};

export const requireAdmin = (req: Request, _res: Response, next: NextFunction) => {
  if (!req.user) throw new AppError('Vui lòng đăng nhập', 401);
  if (req.user.role !== 'ADMIN') throw new AppError('Bạn không có quyền truy cập', 403);
  next();
};
