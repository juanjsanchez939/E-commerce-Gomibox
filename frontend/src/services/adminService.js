import api from './api.js';

export async function getStats() {
  const { data } = await api.get('/admin/stats');
  return data;
}

export async function getProducts(page = 1, limit = 20) {
  const { data } = await api.get('/admin/products', { params: { page, limit } });
  return data;
}

export async function createProduct(productData) {
  const { data } = await api.post('/admin/products', productData);
  return data;
}

export async function updateProduct(id, productData) {
  const { data } = await api.put(`/admin/products/${id}`, productData);
  return data;
}

export async function deleteProduct(id) {
  const { data } = await api.delete(`/admin/products/${id}`);
  return data;
}

export async function getCategories() {
  const { data } = await api.get('/admin/categories');
  return data;
}

export async function getOrders(page = 1) {
  const { data } = await api.get('/admin/orders', { params: { page } });
  return data;
}

export async function updateOrderStatus(id, status) {
  const { data } = await api.put(`/admin/orders/${id}/status`, { status });
  return data;
}
