import { Router } from 'express';
import { validatePromo } from '../controllers/promoController.js';
import { validate } from '../middleware/validate.js';
import { promoValidateSchema } from '../validations/schemas.js';

const router = Router();

router.post('/validate', validate(promoValidateSchema), validatePromo);

export default router;
