import api from './api.js';

export async function validatePromoCode(code, subtotal) {
  const { data } = await api.post('/promo/validate', { code, subtotal });
  return data;
}
