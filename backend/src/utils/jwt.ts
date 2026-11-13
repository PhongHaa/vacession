import jwt from 'jsonwebtoken';
import type { Role } from '@prisma/client';
import { env } from '../config/env.js';

export interface TokenPayload {
  sub: string;
  role: Role;
}

export const signToken = (payload: TokenPayload) =>
  jwt.sign(payload, env.jwtSecret, { expiresIn: env.jwtExpiresInDays * 24 * 60 * 60 });

export const verifyToken = (token: string) => jwt.verify(token, env.jwtSecret) as TokenPayload;
