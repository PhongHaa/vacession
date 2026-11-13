import { Router } from 'express';
import * as c from '../controllers/order.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { validateBody } from '../middlewares/validate.middleware.js';
import { createOrderSchema } from '../validators/order.validator.js';

const router = Router();

router.post('/', validateBody(createOrderSchema), c.create); // khách vãng lai cũng đặt được
router.get('/my', requireAuth, c.myOrders);
router.post('/my/:code/cancel', requireAuth, c.cancelMine);
router.get('/:code', c.getByCode);

export default router;
