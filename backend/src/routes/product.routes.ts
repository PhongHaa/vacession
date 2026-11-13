import { Router } from 'express';
import * as c from '../controllers/product.controller.js';

const router = Router();
router.get('/', c.list);
router.get('/:slug', c.detail);

export default router;
