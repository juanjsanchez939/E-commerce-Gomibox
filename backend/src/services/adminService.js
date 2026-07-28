import { Product } from '../models/Product.js';
import { Category } from '../models/Category.js';
import { User } from '../models/User.js';
import { Order } from '../models/Order.js';
import { ApiError } from '../utils/ApiError.js';

export async function getStats() {
  const [productCount, categoryCount, userCount, orderCount] = await Promise.all([
    Product.countDocuments(),
    Category.countDocuments(),
    User.countDocuments(),
    Order.countDocuments(),
  ]);

  const recentOrders = await Order.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .populate('user', 'name email');

  return { productCount, categoryCount, userCount, orderCount, recentOrders };
}

export async function getProducts(page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  const [products, total] = await Promise.all([
    Product.find().sort({ createdAt: -1 }).skip(skip).limit(limit).populate('category', 'name'),
    Product.countDocuments(),
  ]);
  return { products, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function createProduct(data) {
  if (data.categorySlug) {
    let cat = await Category.findOne({ slug: data.categorySlug });
    if (!cat) {
      cat = await Category.create({
        name: data.categorySlug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
        slug: data.categorySlug,
      });
    }
    data.category = cat._id;
  }
  delete data.categorySlug;
  return Product.create(data);
}

export async function updateProduct(id, data) {
  if (data.categorySlug) {
    let cat = await Category.findOne({ slug: data.categorySlug });
    if (!cat) {
      cat = await Category.create({
        name: data.categorySlug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
        slug: data.categorySlug,
      });
    }
    data.category = cat._id;
  }
  delete data.categorySlug;

  const product = await Product.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  if (!product) throw ApiError.notFound('Product not found');
  return product;
}

export async function deleteProduct(id) {
  const product = await Product.findByIdAndDelete(id);
  if (!product) throw ApiError.notFound('Product not found');
  return product;
}

export async function getCategories() {
  return Category.find().sort({ name: 1 });
}

export async function createCategory(data) {
  return Category.create(data);
}

export async function getOrders(page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  const [orders, total] = await Promise.all([
    Order.find().sort({ createdAt: -1 }).skip(skip).limit(limit).populate('user', 'name email'),
    Order.countDocuments(),
  ]);
  return { orders, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function updateOrderStatus(id, status) {
  const order = await Order.findByIdAndUpdate(id, { status }, { new: true });
  if (!order) throw ApiError.notFound('Order not found');
  return order;
}
