import { Router } from 'express';
import { getReviews, createReview } from '../controllers/reviewController.js';
import { validate } from '../middleware/validate.js';
import { auth } from '../middleware/auth.js';
import { reviewSchema } from '../validations/schemas.js';

const router = Router();

router.get('/product/:productId', getReviews);
router.post('/product/:productId', auth, validate(reviewSchema), createReview);

export default router;
