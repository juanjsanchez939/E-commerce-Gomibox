import { ApiError } from '../utils/ApiError.js';

export function adminAuth(req, _res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return next(ApiError.forbidden('Admin access required'));
  }
  next();
}
