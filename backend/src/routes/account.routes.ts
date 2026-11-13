import { Router } from 'express';
import * as c from '../controllers/account.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { validateBody } from '../middlewares/validate.middleware.js';
import { updateProfileSchema, changePasswordSchema } from '../validators/account.validator.js';

const router = Router();
router.use(requireAuth);

router.put('/profile', validateBody(updateProfileSchema), c.updateProfile);
router.put('/password', validateBody(changePasswordSchema), c.changePassword);

export default router;
