import api from './api.js';

export async function createOrder(orderData) {
  const { data } = await api.post('/orders', orderData);
  return data;
}

export async function getOrders(page = 1) {
  const { data } = await api.get('/orders', { params: { page } });
  return data;
}
