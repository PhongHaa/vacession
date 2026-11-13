import type { Request, Response } from 'express';
import * as accountService from '../services/account.service.js';

export async function updateProfile(req: Request, res: Response) {
  res.json({ user: await accountService.updateProfile(req.user!.id, req.body) });
}

export async function changePassword(req: Request, res: Response) {
  await accountService.changePassword(req.user!.id, req.body.currentPassword, req.body.newPassword);
  res.json({ message: 'Đổi mật khẩu thành công' });
}
