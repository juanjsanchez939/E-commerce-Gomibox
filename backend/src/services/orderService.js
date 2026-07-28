import { Order } from '../models/Order.js';
import { Cart } from '../models/Cart.js';
import { PromoCode } from '../models/PromoCode.js';
import { ApiError } from '../utils/ApiError.js';

function generateOrderNumber() {
  const prefix = 'AURA';
  const random = Math.floor(100000 + Math.random() * 900000);
  return `${prefix}-${random}`;
}

function calculateTax(subtotal) {
  return Math.round(subtotal * 0.08 * 100) / 100;
}

function calculateShipping(method, subtotal, hasFreeShipping) {
  if (hasFreeShipping) return 0;
  const rates = { standard: 5.99, express: 14.99, overnight: 29.99 };
  const rate = rates[method] || rates.standard;
  return subtotal > 150 ? 0 : rate;
}

async function applyPromo(subtotal, promoCode) {
  if (!promoCode) return { discount: 0, promoApplied: null };

  const promo = await PromoCode.findOne({
    code: promoCode.toUpperCase(),
    isActive: true,
    $or: [{ expiresAt: { $gt: new Date() } }, { expiresAt: null }],
  });

  if (!promo) return { discount: 0, promoApplied: null };
  if (promo.minOrder > 0 && subtotal < promo.minOrder) return { discount: 0, promoApplied: null };
  if (promo.usageLimit > 0 && promo.usedCount >= promo.usageLimit) return { discount: 0, promoApplied: null };

  let discount = 0;
  if (promo.discountType === 'percentage') {
    discount = Math.round(subtotal * (promo.discountValue / 100) * 100) / 100;
  } else {
    discount = Math.min(promo.discountValue, subtotal);
  }

  return { discount, promoApplied: promo };
}

export async function createOrder(userId, checkoutData) {
  const cart = await Cart.findOne({ user: userId }).populate('items.product');
  if (!cart || cart.items.length === 0) {
    throw ApiError.badRequest('Cart is empty');
  }

  const { discount, promoApplied } = await applyPromo(
    cart.items.reduce((sum, i) => sum + i.product.price * i.quantity, 0),
    checkoutData.promoCode
  );

  const subtotal = cart.items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  const hasFreeShipping = promoApplied?.code === 'FREESHIP';
  const shipping = calculateShipping(checkoutData.shippingMethod, subtotal, hasFreeShipping);
  const taxableSubtotal = subtotal - discount;
  const tax = calculateTax(taxableSubtotal);
  const total = Math.round((taxableSubtotal + shipping + tax) * 100) / 100;

  const order = await Order.create({
    user: userId,
    orderNumber: generateOrderNumber(),
    items: cart.items.map((item) => ({
      product: item.product._id,
      name: item.product.name,
      price: item.product.price,
      quantity: item.quantity,
      selectedColor: item.selectedColor,
      image: item.product.images?.[0] || item.product.thumbnail || '',
    })),
    shippingAddress: {
      fullName: `${checkoutData.firstName} ${checkoutData.lastName}`,
      address: checkoutData.address,
      apartment: checkoutData.apartment,
      city: checkoutData.city,
      state: checkoutData.state,
      zipCode: checkoutData.zipCode,
      country: checkoutData.country,
      email: checkoutData.email,
      phone: checkoutData.phone,
    },
    paymentMethod: checkoutData.paymentMethod,
    shippingMethod: checkoutData.shippingMethod,
    subtotal,
    discount,
    shipping,
    tax,
    total,
  });

  if (promoApplied && promoApplied.usageLimit > 0) {
    await PromoCode.findByIdAndUpdate(promoApplied._id, { $inc: { usedCount: 1 } });
  }

  await Cart.findOneAndUpdate({ user: userId }, { items: [], promoCode: '' });

  return order;
}

export async function getUserOrders(userId, page = 1, limit = 10) {
  const skip = (page - 1) * limit;

  const [orders, total] = await Promise.all([
    Order.find({ user: userId }).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Order.countDocuments({ user: userId }),
  ]);

  return { orders, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function getOrderById(userId, orderId) {
  const order = await Order.findOne({ _id: orderId, user: userId });
  if (!order) {
    throw ApiError.notFound('Order not found');
  }
  return order;
}
