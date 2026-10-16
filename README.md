# Gomibox E-Commerce

Full-stack e-commerce application built with React 19, Node.js, Express, and MongoDB.

## Tech Stack

**Frontend:** React 19, Vite, React Router, Axios, Context API, Tailwind CSS
**Backend:** Node.js, Express, JWT, bcrypt, Zod, Mongoose
**Database:** MongoDB (Docker)

## Quick Start

### 1. Start MongoDB

```bash
docker compose up -d
```

### 2. Install Backend Dependencies & Seed Data

```bash
cd backend
npm install
npm run seed
```

### 3. Start Backend

```bash
npm run dev
```

### 4. Install & Start Frontend (new terminal)

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173

## Project Structure

```
gomibox-v2/
├── frontend/          # React + Vite SPA
│   └── src/
│       ├── components/    # Reusable UI components
│       ├── context/       # Auth, Cart, Wishlist contexts
│       ├── pages/         # Route pages
│       ├── services/      # Axios API calls
│       ├── routes/        # React Router config
│       └── utils/         # Helpers
├── backend/           # Express REST API
│   └── src/
│       ├── controllers/   # Request handlers
│       ├── middleware/     # Auth, validation, error handling
│       ├── models/        # Mongoose schemas
│       ├── routes/        # API routes
│       ├── services/      # Business logic
│       └── validations/   # Zod schemas
└── docker-compose.yml
```

## Environment Variables

### Backend (.env)

```
PORT=5010
MONGO_URI=mongodb://<usuario>:<password>@127.0.0.1:27018/gomibox?authSource=admin
JWT_SECRET=<generá uno con: openssl rand -base64 48>
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173,http://localhost:5174
```

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/auth/register | No | Register user |
| POST | /api/auth/login | No | Login user |
| GET | /api/auth/me | Yes | Get profile |
| GET | /api/products | No | List products |
| GET | /api/products/:id | No | Get product |
| GET | /api/products/featured | No | Featured products |
| GET | /api/categories | No | List categories |
| GET | /api/cart | Yes | Get cart |
| POST | /api/cart | Yes | Add to cart |
| PUT | /api/cart/:itemId | Yes | Update item |
| DELETE | /api/cart/:itemId | Yes | Remove item |
| POST | /api/orders | Yes | Create order |
| GET | /api/orders | Yes | User orders |
| POST | /api/promo/validate | No | Validate promo code |
| GET | /api/reviews/product/:id | No | Get reviews |
| POST | /api/reviews/product/:id | Yes | Create review |
