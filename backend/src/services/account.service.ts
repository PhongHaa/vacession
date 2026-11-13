import bcrypt from 'bcryptjs';
import type { z } from 'zod';
import { prisma } from '../config/prisma.js';
import { AppError } from '../utils/AppError.js';
import { publicUserSelect } from './auth.service.js';
import type { updateProfileSchema } from '../validators/account.validator.js';

export const updateProfile = (userId: string, data: z.infer<typeof updateProfileSchema>) =>
  prisma.user.update({
    where: { id: userId },
    // undefined -> null để cho phép xóa trắng field
    data: {
      firstName: data.firstName ?? null,
      lastName: data.lastName ?? null,
      phone: data.phone ?? null,
      address: data.address ?? null,
      city: data.city ?? null,
    },
    select: publicUserSelect,
  });

export async function changePassword(userId: string, currentPassword: string, newPassword: string) {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  if (!(await bcrypt.compare(currentPassword, user.passwordHash))) {
    throw new AppError('Mật khẩu hiện tại không đúng', 400);
  }
  await prisma.user.update({ where: { id: userId }, data: { passwordHash: await bcrypt.hash(newPassword, 10) } });
}
