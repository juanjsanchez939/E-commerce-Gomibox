import { PromoCode } from '../models/PromoCode.js';
import { ApiError } from '../utils/ApiError.js';

export async function validatePromoCode(code, subtotal) {
  const promo = await PromoCode.findOne({
    code: code.toUpperCase(),
    isActive: true,
    $or: [{ expiresAt: { $gt: new Date() } }, { expiresAt: null }],
  });

  if (!promo) {
    throw ApiError.notFound('Invalid or expired promo code');
  }

  if (promo.minOrder > 0 && subtotal < promo.minOrder) {
    throw ApiError.badRequest(`Minimum order of $${promo.minOrder} required for this code`);
  }

  if (promo.usageLimit > 0 && promo.usedCount >= promo.usageLimit) {
    throw ApiError.badRequest('This promo code has reached its usage limit');
  }

  let discount = 0;
  if (promo.discountType === 'percentage') {
    discount = Math.round(subtotal * (promo.discountValue / 100) * 100) / 100;
  } else {
    discount = Math.min(promo.discountValue, subtotal);
  }

  return {
    code: promo.code,
    discountType: promo.discountType,
    discountValue: promo.discountValue,
    discountAmount: discount,
  };
}
