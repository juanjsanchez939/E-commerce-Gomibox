import * as promoService from '../services/promoService.js';

export async function validatePromo(req, res, next) {
  try {
    const { code, subtotal } = req.validatedBody;
    const result = await promoService.validatePromoCode(code, subtotal);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
}
