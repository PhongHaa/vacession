import { Router } from 'express';
import * as c from '../controllers/contact.controller.js';
import { validateBody } from '../middlewares/validate.middleware.js';
import { contactSchema } from '../validators/contact.validator.js';

const router = Router();
router.post('/', validateBody(contactSchema), c.create);

export default router;
