import type { z } from 'zod';
import { prisma } from '../config/prisma.js';
import type { contactSchema } from '../validators/contact.validator.js';

export const createMessage = (data: z.infer<typeof contactSchema>) =>
  prisma.contactMessage.create({ data });

export const listMessages = () =>
  prisma.contactMessage.findMany({ orderBy: { createdAt: 'desc' }, take: 200 });

export const markRead = (id: string) =>
  prisma.contactMessage.update({ where: { id }, data: { isRead: true } });
