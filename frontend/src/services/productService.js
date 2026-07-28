import api from './api.js';

export async function getProducts(params = {}) {
  const { data } = await api.get('/products', { params });
  return data;
}

export async function getProductById(id) {
  const { data } = await api.get(`/products/${id}`);
  return data;
}

export async function getFeaturedProducts(limit = 8) {
  const { data } = await api.get('/products/featured', { params: { limit } });
  return data;
}

export async function getCategories() {
  const { data } = await api.get('/categories');
  return data;
}
