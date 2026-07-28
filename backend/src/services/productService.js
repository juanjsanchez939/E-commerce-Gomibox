import { Product } from '../models/Product.js';
import { Category } from '../models/Category.js';
import { ApiError } from '../utils/ApiError.js';

async function resolveCategoryId(categoryParam) {
  if (!categoryParam) return null;

  if (categoryParam.match(/^[0-9a-fA-F]{24}$/)) {
    return categoryParam;
  }

  const cat = await Category.findOne({ slug: categoryParam });
  return cat ? cat._id : null;
}

export async function getProducts(query) {
  const { search, category, sortBy, page, limit, minPrice, maxPrice, minRating, inStock } = query;

  const filter = {};

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { tagline: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { brand: { $regex: search, $options: 'i' } },
    ];
  }

  if (category) {
    const catId = await resolveCategoryId(category);
    if (catId) {
      filter.category = catId;
    }
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    filter.price = {};
    if (minPrice !== undefined) filter.price.$gte = minPrice;
    if (maxPrice !== undefined) filter.price.$lte = maxPrice;
  }

  if (minRating) {
    filter.rating = { $gte: minRating };
  }

  if (inStock) {
    filter.stock = { $gt: 0 };
  }

  const sortMap = {
    'price-asc': { price: 1 },
    'price-desc': { price: -1 },
    'rating-desc': { rating: -1 },
    'name-asc': { name: 1 },
    newest: { createdAt: -1 },
  };
  const sort = sortMap[sortBy] || { createdAt: -1 };

  const skip = (page - 1) * limit;

  const [products, total] = await Promise.all([
    Product.find(filter).sort(sort).skip(skip).limit(limit).populate('category', 'name slug'),
    Product.countDocuments(filter),
  ]);

  return {
    products,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getProductById(id) {
  const product = await Product.findById(id).populate('category', 'name slug');
  if (!product) {
    throw ApiError.notFound('Product not found');
  }
  return product;
}

export async function getProductsByCategory(slug, query) {
  const { page = 1, limit = 20, sortBy } = query;

  const category = await Category.findOne({ slug });
  if (!category) {
    return { products: [], total: 0, page, limit, totalPages: 0 };
  }

  const filter = { category: category._id };

  const sortMap = {
    'price-asc': { price: 1 },
    'price-desc': { price: -1 },
    'rating-desc': { rating: -1 },
    'name-asc': { name: 1 },
    newest: { createdAt: -1 },
  };
  const sort = sortMap[sortBy] || { createdAt: -1 };

  const skip = (page - 1) * limit;

  const [products, total] = await Promise.all([
    Product.find(filter).sort(sort).skip(skip).limit(limit).populate('category', 'name slug'),
    Product.countDocuments(filter),
  ]);

  return {
    products,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getFeaturedProducts(limit = 8) {
  return Product.find({ rating: { $gte: 4 } })
    .sort({ rating: -1, createdAt: -1 })
    .limit(limit)
    .populate('category', 'name slug');
}
