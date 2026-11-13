import { Router } from 'express';
import * as products from '../controllers/product.controller.js';
import * as categories from '../controllers/category.controller.js';
import * as orders from '../controllers/order.controller.js';
import * as contact from '../controllers/contact.controller.js';
import * as upload from '../controllers/upload.controller.js';
import * as customers from '../controllers/customer.controller.js';
import { requireAdmin } from '../middlewares/auth.middleware.js';
import { validateBody } from '../middlewares/validate.middleware.js';
import { uploadImages } from '../middlewares/upload.middleware.js';
import { productInputSchema, categoryInputSchema } from '../validators/product.validator.js';
import { updateOrderStatusSchema } from '../validators/order.validator.js';

const router = Router();
router.use(requireAdmin);

router.get('/stats', orders.adminStats);

router.get('/products', products.adminList);
router.get('/products/:id', products.adminDetail);
router.post('/products', validateBody(productInputSchema), products.create);
router.put('/products/:id', validateBody(productInputSchema), products.update);
router.delete('/products/:id', products.remove);

router.post('/categories', validateBody(categoryInputSchema), categories.create);
router.put('/categories/:id', validateBody(categoryInputSchema), categories.update);
router.delete('/categories/:id', categories.remove);

router.get('/orders', orders.adminList);
router.get('/orders/:id', orders.adminDetail);
router.patch('/orders/:id/status', validateBody(updateOrderStatusSchema), orders.adminUpdateStatus);

router.get('/customers', customers.adminList);

router.get('/messages', contact.adminList);
router.patch('/messages/:id/read', contact.adminMarkRead);

router.post('/upload', uploadImages, upload.uploadImages);

export default router;
