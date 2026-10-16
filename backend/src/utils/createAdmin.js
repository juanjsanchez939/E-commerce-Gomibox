import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { env } from '../config/env.js';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@gomibox.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

async function createAdmin() {
  if (!ADMIN_PASSWORD || ADMIN_PASSWORD.length < 12) {
    console.error(
      'Definí ADMIN_PASSWORD (mínimo 12 caracteres) en el entorno antes de correr este script.'
    );
    process.exit(1);
  }

  try {
    await mongoose.connect(env.MONGO_URI);
    console.log('Connected to MongoDB');

    const existing = await User.findOne({ email: ADMIN_EMAIL });
    if (existing) {
      console.log('Admin user already exists. Updating role...');
      existing.role = 'admin';
      await existing.save();
      console.log('Admin role confirmed.');
    } else {
      await User.create({
        name: 'Admin',
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        role: 'admin',
      });
      console.log(`Admin user created: ${ADMIN_EMAIL}`);
      console.log('Password: tomada de ADMIN_PASSWORD (no se imprime).');
    }

    process.exit(0);
  } catch (error) {
    console.error('Failed:', error.message);
    process.exit(1);
  }
}

createAdmin();
