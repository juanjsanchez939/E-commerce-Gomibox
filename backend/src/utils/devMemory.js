// Dev local sin Docker ni Mongo instalado.
// Levanta Mongo en memoria, siembra demo y arranca la API.
// Uso: npm run dev:memory
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

const mongod = await MongoMemoryServer.create();
process.env.MONGO_URI = mongod.getUri('gomibox');
process.env.JWT_SECRET ??= 'dev_secret_local';
process.env.PORT ??= '5000';

const { default: app } = await import('../app.js');
const { env } = await import('../config/env.js');
const { Category } = await import('../models/Category.js');
const { Product } = await import('../models/Product.js');
const { PromoCode } = await import('../models/PromoCode.js');

await mongoose.connect(process.env.MONGO_URI);
console.log('MongoDB (memoria) conectado');

const prodCount = await Product.countDocuments();
if (prodCount === 0) {
  console.log('Sembrando datos demo...');
  const cats = await Category.insertMany([
    { name: 'Smartphones', slug: 'smartphones', description: 'Celulares y accesorios', icon: '📱' },
    { name: 'Laptops', slug: 'laptops', description: 'Laptops para trabajo y juego', icon: '💻' },
    { name: 'Beauty', slug: 'beauty', description: 'Skincare y maquillaje', icon: '💄' },
    { name: 'Furniture', slug: 'furniture', description: 'Muebles modernos', icon: '🪑' },
  ]);
  const bySlug = Object.fromEntries(cats.map((c) => [c.slug, c._id]));
  const demo = [
    { name: 'iPhone 15 Pro', price: 999, category: bySlug.smartphones, rating: 4.8, stock: 20, brand: 'Apple', tagline: 'Titanio, A17 Pro' },
    { name: 'Samsung Galaxy S24', price: 899, category: bySlug.smartphones, rating: 4.7, stock: 25, brand: 'Samsung', tagline: 'Galaxy AI' },
    { name: 'MacBook Air M3', price: 1099, category: bySlug.laptops, rating: 4.9, stock: 15, brand: 'Apple', tagline: 'Chip M3, 18h batería' },
    { name: 'Dell XPS 15', price: 1299, category: bySlug.laptops, rating: 4.6, stock: 10, brand: 'Dell', tagline: 'OLED 3.5K' },
    { name: 'Chanel No. 5', price: 150, category: bySlug.beauty, rating: 4.5, stock: 40, brand: 'Chanel', tagline: 'Eau de Parfum 100ml' },
    { name: 'Silla Nórdica Oslo', price: 199, category: bySlug.furniture, rating: 4.4, stock: 30, brand: 'Nordic', tagline: 'Roble macizo' },
  ];
  await Product.insertMany(
    demo.map((p, i) => ({
      ...p,
      description: `${p.name} - producto demo para desarrollo local.`,
      images: [`https://picsum.photos/seed/gomibox${i}/600/600`],
      thumbnail: `https://picsum.photos/seed/gomibox${i}/600/600`,
      features: ['Garantía 1 año', 'Envío gratis +$150'],
      sku: `DEMO-${i + 1}`,
      availabilityStatus: 'In Stock',
    }))
  );
  await PromoCode.insertMany([
    { code: 'SAVE20', discountType: 'percentage', discountValue: 20, minOrder: 0, isActive: true },
    { code: 'WELCOME10', discountType: 'flat', discountValue: 10, minOrder: 0, isActive: true },
  ]);
  console.log('Demo sembrada: 4 categorías, 6 productos, 2 promos (SAVE20, WELCOME10)');
} else {
  console.log(`Datos existentes: ${prodCount} productos, no se siembra`);
}

app.listen(Number(env.PORT), () => {
  console.log(`API lista en http://localhost:${env.PORT} (DB en memoria, se pierde al detener)`);
});
