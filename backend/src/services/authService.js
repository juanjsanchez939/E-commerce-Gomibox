import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { User } from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';

function generateToken(userId) {
  return jwt.sign({ id: userId }, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });
}

export async function register({ name, email, password, phone }) {
  const existing = await User.findOne({ email });
  if (existing) {
    throw ApiError.conflict('Email already registered');
  }

  const user = await User.create({ name, email, password, phone });
  const token = generateToken(user._id);

  return { user, token };
}

export async function login({ email, password }) {
  const user = await User.findOne({ email });
  if (!user) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  const token = generateToken(user._id);

  return { user, token };
}

export async function getProfile(userId) {
  const user = await User.findById(userId).select('-password');
  if (!user) {
    throw ApiError.notFound('User not found');
  }
  return user;
}

export async function updateProfile(userId, data) {
  const allowed = ['name', 'phone', 'addresses'];
  const updateData = {};
  for (const key of allowed) {
    if (data[key] !== undefined) updateData[key] = data[key];
  }

  const user = await User.findByIdAndUpdate(userId, updateData, { new: true }).select('-password');
  if (!user) {
    throw ApiError.notFound('User not found');
  }
  return user;
}
