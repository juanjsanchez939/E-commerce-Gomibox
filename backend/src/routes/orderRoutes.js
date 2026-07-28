import { Router } from 'express';
import { createOrder, getOrders, getOrderById } from '../controllers/orderController.js';
import { validate } from '../middleware/validate.js';
import { auth } from '../middleware/auth.js';
import { checkoutSchema } from '../validations/schemas.js';

const router = Router();

router.use(auth);

router.post('/', validate(checkoutSchema), createOrder);
router.get('/', getOrders);
router.get('/:id', getOrderById);

export default router;
