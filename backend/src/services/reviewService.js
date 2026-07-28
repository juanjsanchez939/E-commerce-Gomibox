import { Review } from '../models/Review.js';
import { Product } from '../models/Product.js';
import { ApiError } from '../utils/ApiError.js';

export async function getProductReviews(productId, page = 1, limit = 10) {
  const skip = (page - 1) * limit;

  const [reviews, total] = await Promise.all([
    Review.find({ product: productId })
      .populate('user', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Review.countDocuments({ product: productId }),
  ]);

  return { reviews, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function createReview(userId, productId, { rating, comment }) {
  const product = await Product.findById(productId);
  if (!product) {
    throw ApiError.notFound('Product not found');
  }

  const existing = await Review.findOne({ user: userId, product: productId });
  if (existing) {
    throw ApiError.conflict('You have already reviewed this product');
  }

  const review = await Review.create({ user: userId, product: productId, rating, comment });
  await review.populate('user', 'name');

  const stats = await Review.aggregate([
    { $match: { product: product._id } },
    { $group: { _id: null, avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);

  if (stats.length > 0) {
    await Product.findByIdAndUpdate(productId, {
      rating: Math.round(stats[0].avgRating * 10) / 10,
    });
  }

  return review;
}
