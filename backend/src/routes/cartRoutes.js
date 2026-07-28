import { Router } from 'express';
import { getCart, addToCart, updateCartItem, removeCartItem, clearCart } from '../controllers/cartController.js';
import { validate } from '../middleware/validate.js';
import { auth } from '../middleware/auth.js';
import { cartAddSchema, cartUpdateSchema } from '../validations/schemas.js';

const router = Router();

router.use(auth);

router.get('/', getCart);
router.post('/', validate(cartAddSchema), addToCart);
router.put('/:itemId', validate(cartUpdateSchema), updateCartItem);
router.delete('/:itemId', removeCartItem);
router.delete('/', clearCart);

export default router;
