import { Router } from 'express';
import { getProducts, getProductById, getProductsByCategory, getFeaturedProducts } from '../controllers/productController.js';
import { validateQuery } from '../middleware/validate.js';
import { productQuerySchema } from '../validations/schemas.js';

const router = Router();

router.get('/', validateQuery(productQuerySchema), getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/category/:slug', validateQuery(productQuerySchema), getProductsByCategory);
router.get('/:id', getProductById);

export default router;
