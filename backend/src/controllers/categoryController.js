import * as categoryService from '../services/categoryService.js';

export async function getCategories(_req, res, next) {
  try {
    const categories = await categoryService.getCategories();
    res.json({ success: true, data: categories });
  } catch (error) {
    next(error);
  }
}

export async function getCategoryBySlug(req, res, next) {
  try {
    const category = await categoryService.getCategoryBySlug(req.params.slug);
    res.json({ success: true, data: category });
  } catch (error) {
    next(error);
  }
}

export async function getCategoryNames(_req, res, next) {
  try {
    const names = await categoryService.getCategoryNames();
    res.json({ success: true, data: names });
  } catch (error) {
    next(error);
  }
}
