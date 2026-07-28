import api from './api.js';

export async function getCart() {
  const { data } = await api.get('/cart');
  return data;
}

export async function addToCart(productId, quantity = 1, selectedColor = '') {
  const { data } = await api.post('/cart', { productId, quantity, selectedColor });
  return data;
}

export async function updateCartItem(itemId, quantity) {
  const { data } = await api.put(`/cart/${itemId}`, { quantity });
  return data;
}

export async function removeCartItem(itemId) {
  const { data } = await api.delete(`/cart/${itemId}`);
  return data;
}

export async function clearCart() {
  const { data } = await api.delete('/cart');
  return data;
}
