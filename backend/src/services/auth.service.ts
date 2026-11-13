import bcrypt from 'bcryptjs';
import { createHash, randomBytes } from 'node:crypto';
import type { z } from 'zod';
import { prisma } from '../config/prisma.js';
import { env } from '../config/env.js';
import { AppError } from '../utils/AppError.js';
import { sendMail } from '../utils/mailer.js';
import type { registerSchema } from '../validators/auth.validator.js';

/** Các field an toàn để trả về client (không có passwordHash) */
export const publicUserSelect = {
  id: true, email: true, firstName: true, lastName: true,
  phone: true, address: true, city: true, role: true, createdAt: true,
} as const;

const hashToken = (token: string) => createHash('sha256').update(token).digest('hex');

export async function register(input: z.infer<typeof registerSchema>) {
  const exists = await prisma.user.findUnique({ where: { email: input.email } });
  if (exists) throw new AppError('Email này đã được đăng ký', 409);

  return prisma.user.create({
    data: {
      email: input.email,
      passwordHash: await bcrypt.hash(input.password, 10),
      firstName: input.firstName,
      lastName: input.lastName,
    },
    select: publicUserSelect,
  });
}

export async function login(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    throw new AppError('Email hoặc mật khẩu không đúng', 401);
  }
  const { passwordHash: _, ...safe } = user;
  return safe;
}

export const getUserById = (id: string) =>
  prisma.user.findUnique({ where: { id }, select: publicUserSelect });

export async function forgotPassword(email: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  // Luôn trả về thành công để không lộ email nào đã đăng ký
  if (!user) return;

  const token = randomBytes(32).toString('hex');
  await prisma.passwordResetToken.create({
    data: { userId: user.id, tokenHash: hashToken(token), expiresAt: new Date(Date.now() + 60 * 60 * 1000) },
  });

  const link = `${env.clientUrl}/my-account/reset-password?token=${token}`;
  await sendMail(user.email, 'Đặt lại mật khẩu',
    `Nhấn vào link sau để đặt lại mật khẩu (hết hạn sau 1 giờ):\n${link}`);
}

export async function resetPassword(token: string, password: string) {
  const record = await prisma.passwordResetToken.findUnique({ where: { tokenHash: hashToken(token) } });
  if (!record || record.usedAt || record.expiresAt < new Date()) {
    throw new AppError('Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn', 400);
  }
  await prisma.$transaction([
    prisma.user.update({ where: { id: record.userId }, data: { passwordHash: await bcrypt.hash(password, 10) } }),
    prisma.passwordResetToken.update({ where: { id: record.id }, data: { usedAt: new Date() } }),
  ]);
}
