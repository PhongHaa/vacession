import type { Request, Response } from 'express';
import * as authService from '../services/auth.service.js';
import { signToken } from '../utils/jwt.js';
import { env } from '../config/env.js';
import { AUTH_COOKIE } from '../middlewares/auth.middleware.js';

function setAuthCookie(res: Response, user: { id: string; role: 'CUSTOMER' | 'ADMIN' }, remember: boolean) {
  res.cookie(AUTH_COOKIE, signToken({ sub: user.id, role: user.role }), {
    httpOnly: true,
    sameSite: 'lax',
    secure: env.isProd,
    path: '/',
    // Không tick "Ghi nhớ" -> cookie mất khi đóng trình duyệt
    maxAge: remember ? env.jwtExpiresInDays * 24 * 60 * 60 * 1000 : undefined,
  });
}

export async function register(req: Request, res: Response) {
  const user = await authService.register(req.body);
  setAuthCookie(res, user, true);
  res.status(201).json({ user });
}

export async function login(req: Request, res: Response) {
  const user = await authService.login(req.body.email, req.body.password);
  setAuthCookie(res, user, req.body.remember);
  res.json({ user });
}

export function logout(_req: Request, res: Response) {
  res.clearCookie(AUTH_COOKIE, { path: '/' });
  res.json({ message: 'Đã đăng xuất' });
}

export async function me(req: Request, res: Response) {
  if (!req.user) return res.json({ user: null });
  const user = await authService.getUserById(req.user.id);
  if (!user) res.clearCookie(AUTH_COOKIE, { path: '/' });
  res.json({ user });
}

export async function forgotPassword(req: Request, res: Response) {
  await authService.forgotPassword(req.body.email);
  res.json({ message: 'Nếu email tồn tại, link đặt lại mật khẩu đã được gửi.' });
}

export async function resetPassword(req: Request, res: Response) {
  await authService.resetPassword(req.body.token, req.body.password);
  res.json({ message: 'Đặt lại mật khẩu thành công. Vui lòng đăng nhập.' });
}
