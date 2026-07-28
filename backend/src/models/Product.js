import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reviewerName: { type: String },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
  },
  { timestamps: true }
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    tagline: { type: String, default: '' },
    description: { type: String, default: '' },
    price: { type: Number, required: true, min: 0 },
    discountPercentage: { type: Number, default: 0, min: 0, max: 100 },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    stock: { type: Number, default: 0, min: 0 },
    images: [{ type: String }],
    thumbnail: { type: String, default: '' },
    colors: [{ type: String }],
    features: [{ type: String }],
    brand: { type: String, default: '' },
    sku: { type: String, default: '' },
    weight: { type: Number, default: 0 },
    dimensions: {
      width: { type: Number, default: 0 },
      height: { type: Number, default: 0 },
      depth: { type: Number, default: 0 },
    },
    warrantyInformation: { type: String, default: '' },
    shippingInformation: { type: String, default: '' },
    returnPolicy: { type: String, default: '' },
    availabilityStatus: { type: String, default: 'In Stock' },
    minimumOrderQuantity: { type: Number, default: 1 },
    reviews: [reviewSchema],
  },
  { timestamps: true }
);

productSchema.index({ name: 'text', tagline: 'text', description: 'text', brand: 'text' });
productSchema.index({ category: 1 });
productSchema.index({ price: 1 });
productSchema.index({ rating: -1 });

export const Product = mongoose.model('Product', productSchema);
