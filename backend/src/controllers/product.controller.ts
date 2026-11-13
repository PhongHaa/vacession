import type { Request, Response } from 'express';
import * as productService from '../services/product.service.js';
import { productQuerySchema, adminProductQuerySchema } from '../validators/product.validator.js';

export async function list(req: Request, res: Response) {
  res.json(await productService.listProducts(productQuerySchema.parse(req.query)));
}

export async function detail(req: Request<{ slug: string }>, res: Response) {
  res.json(await productService.getProductBySlug(req.params.slug));
}

// ---------- Admin ----------
export async function adminList(req: Request, res: Response) {
  res.json(await productService.adminListProducts(adminProductQuerySchema.parse(req.query)));
}

export async function adminDetail(req: Request<{ id: string }>, res: Response) {
  res.json(await productService.adminGetProduct(req.params.id));
}

export async function create(req: Request, res: Response) {
  res.status(201).json(await productService.createProduct(req.body));
}

export async function update(req: Request<{ id: string }>, res: Response) {
  res.json(await productService.updateProduct(req.params.id, req.body));
}

export async function remove(req: Request<{ id: string }>, res: Response) {
  await productService.deleteProduct(req.params.id);
  res.status(204).end();
}
