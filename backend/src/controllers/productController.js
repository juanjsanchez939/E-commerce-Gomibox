import * as productService from '../services/productService.js';

export async function getProducts(req, res, next) {
  try {
    const result = await productService.getProducts(req.validatedQuery);
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
}

export async function getProductById(req, res, next) {
  try {
    const product = await productService.getProductById(req.params.id);
    res.json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
}

export async function getProductsByCategory(req, res, next) {
  try {
    const result = await productService.getProductsByCategory(req.params.slug, req.validatedQuery);
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
}

export async function getFeaturedProducts(req, res, next) {
  try {
    const limit = parseInt(req.query.limit) || 8;
    const products = await productService.getFeaturedProducts(limit);
    res.json({ success: true, data: products });
  } catch (error) {
    next(error);
  }
}
