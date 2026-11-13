import type { Request, Response } from 'express';
import * as categoryService from '../services/category.service.js';

export async function list(_req: Request, res: Response) {
  const categories = await categoryService.listCategories();
  res.json(categories.map(({ _count, ...c }) => ({ ...c, productCount: _count.products })));
}

export async function create(req: Request, res: Response) {
  res.status(201).json(await categoryService.createCategory(req.body));
}

export async function update(req: Request<{ id: string }>, res: Response) {
  res.json(await categoryService.updateCategory(req.params.id, req.body));
}

export async function remove(req: Request<{ id: string }>, res: Response) {
  await categoryService.deleteCategory(req.params.id);
  res.status(204).end();
}
