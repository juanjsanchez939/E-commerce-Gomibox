import mongoose from 'mongoose';
import { Category } from '../models/Category.js';
import { Product } from '../models/Product.js';
import { PromoCode } from '../models/PromoCode.js';
import { env } from '../config/env.js';

const categories = [
  { name: 'Gomitas', slug: 'gomitas', description: 'Gomitas Mogul de todos los sabores', icon: '🍬' },
];

const promoCodes = [
  { code: 'SAVE20', discountType: 'percentage', discountValue: 20, minOrder: 0, isActive: true },
  { code: 'WELCOME10', discountType: 'flat', discountValue: 10, minOrder: 0, isActive: true },
  { code: 'FREESHIP', discountType: 'flat', discountValue: 15, minOrder: 0, isActive: true },
];

// Catálogo Gomitas Mogul. Imágenes en frontend/public/products/<slug>.webp
// Precios tomados de arcorencasa.com (ARS). Stock de referencia: 10.
const STOCK = 10;

const gomitas = [
  { name: 'Gomitas Mogul Mini Twist sabor Uva', slug: 'mini-twist-uva', price: 10575, sku: '15509DI' },
  { name: 'Gomitas Mogul Extreme Frutillas', slug: 'extreme-frutillas', price: 10498, sku: '14888DI' },
  { name: 'Gomitas Mogul Extreme Gusanitos', slug: 'extreme-gusanitos', price: 10498, sku: '15503DI' },
  { name: 'Gomitas Mogul Jelly Beans', slug: 'jelly-beans', price: 10498, sku: '14185DI' },
  { name: 'Gomitas Mogul Extreme Sandias', slug: 'extreme-sandias', price: 10498, sku: '14800DI' },
  { name: 'Gomitas Mogul Extreme Ositos', slug: 'extreme-ositos', price: 10498, sku: '14799DI' },
  { name: 'Gomitas Mogul Extreme Ladrillos de Frutilla', slug: 'extreme-ladrillos-frutilla', price: 10575, sku: '14164DI' },
  { name: 'Gomitas Mogul Frutillas y Crema', slug: 'frutillas-y-crema', price: 10498, sku: '10747DI' },
  { name: 'Gomitas Mogul Dientes', slug: 'dientes', price: 10498, sku: '2631DI' },
  { name: 'Gomitas Mogul Anillos', slug: 'anillos', price: 16646, sku: '3096DI' },
  { name: 'Gomitas Mogul Moras', slug: 'moras', price: 10498, sku: '2624DI' },
  { name: 'Gomitas Mogul Eucaliptus', slug: 'eucaliptus', price: 16646, sku: '3092DI' },
  { name: 'Gomitas Mogul Conitos', slug: 'conitos', price: 16646, sku: '3113DI' },
  { name: 'Gomitas Mogul Jelly Buttons', slug: 'jelly-buttons', price: 16646, sku: '3081DI' },
  { name: 'Gomitas Mogul Rollo Berries', slug: 'rollo-berries', price: 720, sku: '15544' },
  { name: 'Gomitas Mogul Cerebritos Rellenas Pintalenguas', slug: 'cerebritos-pintalenguas', price: 731.5, sku: '15456' },
  { name: 'Gomitas Mogul Extreme Tubitos Max de Tutti Frutti', slug: 'extreme-tubitos-tutti-frutti', price: 557.92, sku: '14049' },
  { name: 'Gomitas Mogul Extreme Lenguas Max de Tutti Frutti', slug: 'extreme-lenguas-tutti-frutti', price: 557.92, sku: '14167' },
];

async function seed() {
  try {
    await mongoose.connect(env.MONGO_URI);
    console.log('Connected to MongoDB');

    await Category.deleteMany({});
    await Product.deleteMany({});
    await PromoCode.deleteMany({});

    console.log('Inserting categories...');
    const createdCategories = await Category.insertMany(categories);
    const gomitasCategory = createdCategories[0];
    console.log(`  ${createdCategories.length} category inserted`);

    console.log('Inserting promo codes...');
    await PromoCode.insertMany(promoCodes);
    console.log(`  ${promoCodes.length} promo codes inserted`);

    console.log('Inserting products...');
    const productDocs = gomitas.map((g) => ({
      name: g.name,
      tagline: g.tagline || 'Gomitas Mogul',
      description: `${g.name} — gomitas Mogul para compartir.`,
      price: g.price,
      category: gomitasCategory._id,
      rating: 4.5,
      stock: STOCK,
      images: [`/products/${g.slug}.webp`],
      thumbnail: `/products/${g.slug}.webp`,
      brand: 'Mogul',
      sku: g.sku,
      features: ['Gomitas Mogul', 'Ideal para compartir'],
      availabilityStatus: 'In Stock',
      minimumOrderQuantity: 1,
    }));

    await Product.insertMany(productDocs);
    console.log(`  ${productDocs.length} products inserted`);

    console.log('Seed completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error.message);
    process.exit(1);
  }
}

seed();
