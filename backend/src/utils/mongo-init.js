db = db.getSiblingDB('gomibox');

db.createUser({
  user: 'gomibox_user',
  pwd: 'gomibox_pass',
  roles: [{ role: 'readWrite', db: 'gomibox' }],
});

db.createCollection('products');
db.createCollection('categories');
db.createCollection('users');
db.createCollection('carts');
db.createCollection('orders');
db.createCollection('reviews');
db.createCollection('promocodes');
