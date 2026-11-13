import { Router } from 'express';
import healthRoutes from './health.routes.js';
import authRoutes from './auth.routes.js';
import accountRoutes from './account.routes.js';
import categoryRoutes from './category.routes.js';
import productRoutes from './product.routes.js';
import orderRoutes from './order.routes.js';
import contactRoutes from './contact.routes.js';
import adminRoutes from './admin.routes.js';
import { getSettings } from '../controllers/settings.controller.js';

const router = Router();

router.use('/health', healthRoutes);
router.get('/settings', getSettings);
router.use('/auth', authRoutes);
router.use('/account', accountRoutes);
router.use('/categories', categoryRoutes);
router.use('/products', productRoutes);
router.use('/orders', orderRoutes);
router.use('/contact', contactRoutes);
router.use('/admin', adminRoutes);

export default router;
