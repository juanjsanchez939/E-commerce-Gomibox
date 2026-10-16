import dotenv from 'dotenv';

dotenv.config();

// Falla al arrancar si falta configuración crítica: nunca caer en valores por defecto.
const REQUIRED = ['MONGO_URI', 'JWT_SECRET'];
const missing = REQUIRED.filter((key) => !process.env[key]);

if (missing.length > 0) {
  throw new Error(
    `Faltan variables de entorno obligatorias: ${missing.join(', ')}. ` +
      'Copiá backend/.env.example a backend/.env y completá los valores.'
  );
}

if (process.env.JWT_SECRET.length < 32) {
  throw new Error(
    'JWT_SECRET debe tener al menos 32 caracteres. Generá uno con: openssl rand -base64 48'
  );
}

export const env = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGO_URI: process.env.MONGO_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173,http://localhost:5174',
};
