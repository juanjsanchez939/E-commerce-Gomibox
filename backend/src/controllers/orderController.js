import * as orderService from '../services/orderService.js';

export async function createOrder(req, res, next) {
  try {
    const order = await orderService.createOrder(req.user._id, req.validatedBody);
    res.status(201).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
}

export async function getOrders(req, res, next) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const result = await orderService.getUserOrders(req.user._id, page, limit);
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
}

export async function getOrderById(req, res, next) {
  try {
    const order = await orderService.getOrderById(req.user._id, req.params.id);
    res.json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
}
