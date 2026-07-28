import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { env } from '../config/env.js';

async function createAdmin() {
  try {
    await mongoose.connect(env.MONGO_URI);
    console.log('Connected to MongoDB');

    const existing = await User.findOne({ email: 'admin@gomibox.com' });
    if (existing) {
      console.log('Admin user already exists. Updating role...');
      existing.role = 'admin';
      await existing.save();
      console.log('Admin role confirmed.');
    } else {
      await User.create({
        name: 'Admin',
        email: 'admin@gomibox.com',
        password: 'admin123',
        role: 'admin',
      });
      console.log('Admin user created!');
      console.log('Email: admin@gomibox.com');
      console.log('Password: admin123');
    }

    process.exit(0);
  } catch (error) {
    console.error('Failed:', error.message);
    process.exit(1);
  }
}

createAdmin();
