import * as cartService from '../services/cartService.js';

export async function getCart(req, res, next) {
  try {
    const cart = await cartService.getCart(req.user._id);
    res.json({ success: true, data: cart });
  } catch (error) {
    next(error);
  }
}

export async function addToCart(req, res, next) {
  try {
    const cart = await cartService.addToCart(req.user._id, req.validatedBody);
    res.json({ success: true, data: cart });
  } catch (error) {
    next(error);
  }
}

export async function updateCartItem(req, res, next) {
  try {
    const cart = await cartService.updateCartItem(req.user._id, req.params.itemId, req.validatedBody);
    res.json({ success: true, data: cart });
  } catch (error) {
    next(error);
  }
}

export async function removeCartItem(req, res, next) {
  try {
    const cart = await cartService.removeCartItem(req.user._id, req.params.itemId);
    res.json({ success: true, data: cart });
  } catch (error) {
    next(error);
  }
}

export async function clearCart(req, res, next) {
  try {
    await cartService.clearCart(req.user._id);
    res.json({ success: true, message: 'Cart cleared' });
  } catch (error) {
    next(error);
  }
}
