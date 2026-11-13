import { Router } from 'express';
import * as c from '../controllers/auth.controller.js';
import { validateBody } from '../middlewares/validate.middleware.js';
import {
  registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema,
} from '../validators/auth.validator.js';

const router = Router();

router.post('/register', validateBody(registerSchema), c.register);
router.post('/login', validateBody(loginSchema), c.login);
router.post('/logout', c.logout);
router.get('/me', c.me);
router.post('/forgot-password', validateBody(forgotPasswordSchema), c.forgotPassword);
router.post('/reset-password', validateBody(resetPasswordSchema), c.resetPassword);

export default router;
