import type { Request, Response, NextFunction } from 'express';
import type { ZodTypeAny } from 'zod';

/** Kiểm tra & làm sạch req.body theo schema zod */
export const validateBody = (schema: ZodTypeAny) =>
  (req: Request, _res: Response, next: NextFunction) => {
    req.body = schema.parse(req.body);
    next();
  };
