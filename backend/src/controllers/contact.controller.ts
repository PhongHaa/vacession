import type { Request, Response } from 'express';
import * as contactService from '../services/contact.service.js';

export async function create(req: Request, res: Response) {
  await contactService.createMessage(req.body);
  res.status(201).json({ message: 'Cảm ơn bạn! Chúng tôi sẽ phản hồi sớm nhất.' });
}

export async function adminList(_req: Request, res: Response) {
  res.json(await contactService.listMessages());
}

export async function adminMarkRead(req: Request<{ id: string }>, res: Response) {
  res.json(await contactService.markRead(req.params.id));
}
