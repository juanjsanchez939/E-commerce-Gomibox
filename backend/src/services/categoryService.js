import { Category } from '../models/Category.js';
import { ApiError } from '../utils/ApiError.js';

export async function getCategories() {
  return Category.find().sort({ name: 1 });
}

export async function getCategoryBySlug(slug) {
  const category = await Category.findOne({ slug });
  if (!category) {
    throw ApiError.notFound('Category not found');
  }
  return category;
}

export async function getCategoryNames() {
  const categories = await Category.find().select('name slug -_id').sort({ name: 1 });
  return categories.map((c) => c.slug);
}
