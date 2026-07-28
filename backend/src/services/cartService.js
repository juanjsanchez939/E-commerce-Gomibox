import { Cart } from '../models/Cart.js';
import { Product } from '../models/Product.js';
import { ApiError } from '../utils/ApiError.js';

function cartWithTotals(cart) {
  if (!cart) return null;

  let subtotal = 0;
  const items = cart.items.map((item) => {
    if (item.product && typeof item.product === 'object') {
      subtotal += item.product.price * item.quantity;
    }
    return item;
  });

  return {
    ...cart.toObject(),
    items,
    subtotal: Math.round(subtotal * 100) / 100,
    itemCount: items.reduce((sum, i) => sum + i.quantity, 0),
  };
}

export async function getCart(userId) {
  let cart = await Cart.findOne({ user: userId }).populate('items.product');
  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
  }
  return cartWithTotals(cart);
}

export async function addToCart(userId, { productId, quantity, selectedColor }) {
  const product = await Product.findById(productId);
  if (!product) {
    throw ApiError.notFound('Product not found');
  }

  if (product.stock < quantity) {
    throw ApiError.badRequest('Not enough stock available');
  }

  let cart = await Cart.findOne({ user: userId });
  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
  }

  const existingIndex = cart.items.findIndex(
    (i) => i.product.toString() === productId && i.selectedColor === (selectedColor || '')
  );

  if (existingIndex > -1) {
    cart.items[existingIndex].quantity += quantity;
  } else {
    cart.items.push({ product: productId, quantity, selectedColor: selectedColor || '' });
  }

  await cart.save();

  cart = await Cart.findOne({ user: userId }).populate('items.product');
  return cartWithTotals(cart);
}

export async function updateCartItem(userId, itemId, { quantity }) {
  const cart = await Cart.findOne({ user: userId });
  if (!cart) {
    throw ApiError.notFound('Cart not found');
  }

  const itemIndex = cart.items.findIndex((i) => i._id.toString() === itemId);
  if (itemIndex === -1) {
    throw ApiError.notFound('Item not found in cart');
  }

  cart.items[itemIndex].quantity = quantity;
  await cart.save();

  const updated = await Cart.findOne({ user: userId }).populate('items.product');
  return cartWithTotals(updated);
}

export async function removeCartItem(userId, itemId) {
  const cart = await Cart.findOne({ user: userId });
  if (!cart) {
    throw ApiError.notFound('Cart not found');
  }

  cart.items = cart.items.filter((i) => i._id.toString() !== itemId);
  await cart.save();

  const updated = await Cart.findOne({ user: userId }).populate('items.product');
  return cartWithTotals(updated);
}

export async function clearCart(userId) {
  await Cart.findOneAndUpdate({ user: userId }, { items: [], promoCode: '' });
}
