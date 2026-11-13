import type { Request, Response } from 'express';
import { z } from 'zod';
import * as customerService from '../services/customer.service.js';
import { paginationSchema } from '../validators/common.js';

const querySchema = paginationSchema.extend({ q: z.string().trim().optional() });

export async function adminList(req: Request, res: Response) {
  res.json(await customerService.adminListCustomers(querySchema.parse(req.query)));
}
