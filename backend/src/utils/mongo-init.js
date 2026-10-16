// Script de inicialización de MongoDB (mongosh).
// OJO: no está montado en docker-compose.yml, así que no se ejecuta solo.
// Las credenciales se leen del entorno: nunca hardcodear.
const dbName = process.env.MONGO_DATABASE || 'gomibox';

db = db.getSiblingDB(dbName);

db.createUser({
  user: process.env.MONGO_APP_USERNAME,
  pwd: process.env.MONGO_APP_PASSWORD,
  roles: [{ role: 'readWrite', db: dbName }],
});

db.createCollection('products');
db.createCollection('categories');
db.createCollection('users');
db.createCollection('orders');
db.createCollection('reviews');
db.createCollection('promocodes');
