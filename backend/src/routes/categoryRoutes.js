import { Router } from 'express';
import { getCategories, getCategoryBySlug, getCategoryNames } from '../controllers/categoryController.js';

const router = Router();

router.get('/', getCategories);
router.get('/names', getCategoryNames);
router.get('/:slug', getCategoryBySlug);

export default router;
