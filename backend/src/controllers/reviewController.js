import * as reviewService from '../services/reviewService.js';

export async function getReviews(req, res, next) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const result = await reviewService.getProductReviews(req.params.productId, page, limit);
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
}

export async function createReview(req, res, next) {
  try {
    const review = await reviewService.createReview(req.user._id, req.params.productId, req.validatedBody);
    res.status(201).json({ success: true, data: review });
  } catch (error) {
    next(error);
  }
}
