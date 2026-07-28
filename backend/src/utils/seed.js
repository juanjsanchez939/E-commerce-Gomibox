import mongoose from 'mongoose';
import { Category } from '../models/Category.js';
import { Product } from '../models/Product.js';
import { PromoCode } from '../models/PromoCode.js';
import { env } from '../config/env.js';

const categories = [
  { name: 'Smartphones', slug: 'smartphones', description: 'Latest mobile phones and accessories', icon: '📱' },
  { name: 'Laptops', slug: 'laptops', description: 'Powerful laptops for work and play', icon: '💻' },
  { name: 'Mens Watches', slug: 'mens-watches', description: 'Premium timepieces for men', icon: '⌚' },
  { name: 'Womens Watches', slug: 'womens-watches', description: 'Elegant watches for women', icon: '⌚' },
  { name: 'Beauty', slug: 'beauty', description: 'Skincare, makeup, and fragrances', icon: '💄' },
  { name: 'Furniture', slug: 'furniture', description: 'Modern furniture for your home', icon: '🪑' },
  { name: 'Womens Bags', slug: 'womens-bags', description: 'Stylish bags and purses', icon: '👜' },
  { name: 'Fragrances', slug: 'fragrances', description: 'Luxury perfumes and colognes', icon: '🌸' },
  { name: 'Groceries', slug: 'groceries', description: 'Fresh food and essentials', icon: '🛒' },
  { name: 'Home Decoration', slug: 'home-decoration', description: 'Beautiful decor for every room', icon: '🏠' },
  { name: 'Sunglasses', slug: 'sunglasses', description: 'Trendy sunglasses and eyewear', icon: '🕶️' },
];

const promoCodes = [
  { code: 'SAVE20', discountType: 'percentage', discountValue: 20, minOrder: 0, isActive: true },
  { code: 'WELCOME10', discountType: 'flat', discountValue: 10, minOrder: 0, isActive: true },
  { code: 'FREESHIP', discountType: 'flat', discountValue: 15, minOrder: 0, isActive: true },
];

async function fetchDummyData() {
  console.log('Fetching products from DummyJSON...');
  const allProducts = [];
  const totalToFetch = 100;

  for (let skip = 0; skip < totalToFetch; skip += 30) {
    const limit = Math.min(30, totalToFetch - skip);
    try {
      const res = await fetch(`https://dummyjson.com/products?limit=${limit}&skip=${skip}&select=title,description,category,price,discountPercentage,rating,stock,tags,brand,sku,weight,dimensions,warrantyInformation,shippingInformation,availabilityStatus,returnPolicy,minimumOrderQuantity,images,thumbnail,reviews`);
      const data = await res.json();
      allProducts.push(...(data.products || []));
      console.log(`  Fetched ${allProducts.length}/${totalToFetch} products`);
    } catch (err) {
      console.warn(`  Failed batch at skip=${skip}: ${err.message}`);
    }
  }

  return allProducts;
}

async function seed() {
  try {
    await mongoose.connect(env.MONGO_URI);
    console.log('Connected to MongoDB');

    await Category.deleteMany({});
    await Product.deleteMany({});
    await PromoCode.deleteMany({});

    console.log('Inserting categories...');
    const createdCategories = await Category.insertMany(categories);
    const categoryMap = {};
    for (const cat of createdCategories) {
      categoryMap[cat.slug] = cat._id;
    }
    console.log(`  ${createdCategories.length} categories inserted`);

    console.log('Inserting promo codes...');
    await PromoCode.insertMany(promoCodes);
    console.log(`  ${promoCodes.length} promo codes inserted`);

    const dummyProducts = await fetchDummyData();

    if (dummyProducts.length > 0) {
      console.log('Transforming and inserting products...');
      const productDocs = [];

      for (const dp of dummyProducts) {
        const slug = (dp.category || 'beauty').toLowerCase().replace(/\s+/g, '-');
        let catId = categoryMap[slug];

        if (!catId) {
          const name = slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
          const newCat = await Category.create({ name, slug, description: `${name} products`, icon: '📦' });
          categoryMap[slug] = newCat._id;
          catId = newCat._id;
          console.log(`  Created new category: ${name}`);
        }

        productDocs.push({
          name: dp.title || 'Product',
          tagline: dp.brand ? `By ${dp.brand}` : '',
          description: dp.description || '',
          price: dp.price || 0,
          discountPercentage: dp.discountPercentage || 0,
          category: catId,
          rating: dp.rating || 0,
          stock: dp.stock || 0,
          images: dp.images || [],
          thumbnail: dp.thumbnail || '',
          features: [
            dp.brand && `Brand: ${dp.brand}`,
            dp.warrantyInformation,
            dp.shippingInformation,
            dp.returnPolicy,
            ...(dp.tags || []).map((t) => t.charAt(0).toUpperCase() + t.slice(1)),
          ].filter(Boolean),
          brand: dp.brand || '',
          sku: dp.sku || '',
          weight: dp.weight || 0,
          dimensions: dp.dimensions || { width: 0, height: 0, depth: 0 },
          warrantyInformation: dp.warrantyInformation || '',
          shippingInformation: dp.shippingInformation || '',
          returnPolicy: dp.returnPolicy || '',
          availabilityStatus: dp.availabilityStatus || 'In Stock',
          minimumOrderQuantity: dp.minimumOrderQuantity || 1,
          reviews: (dp.reviews || []).map((r) => ({
            reviewerName: r.reviewerName || 'Anonymous',
            rating: r.rating,
            comment: r.comment,
          })),
        });
      }

      await Product.insertMany(productDocs);
      console.log(`  ${productDocs.length} products inserted`);
    } else {
      console.warn('No products fetched from DummyJSON. Inserting fallback products...');
      await insertFallbackProducts(categoryMap);
    }

    console.log('Seed completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error.message);
    process.exit(1);
  }
}

async function insertFallbackProducts(categoryMap) {
  const catIds = Object.values(categoryMap);
  const fallbackProducts = [];

  const productNames = [
    { name: 'iPhone 15 Pro', cat: 'smartphones', price: 999, rating: 4.8, discount: 5 },
    { name: 'Samsung Galaxy S24', cat: 'smartphones', price: 899, rating: 4.7, discount: 10 },
    { name: 'MacBook Air M3', cat: 'laptops', price: 1099, rating: 4.9, discount: 0 },
    { name: 'Dell XPS 15', cat: 'laptops', price: 1299, rating: 4.6, discount: 15 },
    { name: 'Rolex Submariner', cat: 'mens-watches', price: 8999, rating: 5.0, discount: 0 },
    { name: 'Omega Speedmaster', cat: 'mens-watches', price: 6200, rating: 4.9, discount: 8 },
    { name: 'Chanel No. 5', cat: 'beauty', price: 150, rating: 4.5, discount: 0 },
    { name: 'Dior Lip Glow', cat: 'beauty', price: 40, rating: 4.3, discount: 12 },
  ];

  for (const p of productNames) {
    const catId = categoryMap[p.cat] || catIds[0];
    fallbackProducts.push({
      name: p.name,
      tagline: `Premium quality ${p.cat.replace('-', ' ')}`,
      description: `${p.name} - a top-tier product in the ${p.cat} category.`,
      price: p.price,
      discountPercentage: p.discount,
      category: catId,
      rating: p.rating,
      stock: Math.floor(Math.random() * 100) + 5,
      images: [],
      thumbnail: '',
      features: ['Premium quality', '1 year warranty', 'Free shipping'],
      brand: 'Brand',
      sku: `SKU-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      availabilityStatus: 'In Stock',
      minimumOrderQuantity: 1,
      reviews: [],
    });
  }

  await Product.insertMany(fallbackProducts);
  console.log(`  ${fallbackProducts.length} fallback products inserted`);
}

seed();
