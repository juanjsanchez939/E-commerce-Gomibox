# Gomibox E-Commerce

Full-stack e-commerce application built with React 19, ASP.NET Core .NET 10, and MongoDB.

## Tech Stack

**Frontend:** React 19, Vite, React Router, Axios, Context API, Tailwind CSS
**Backend:** ASP.NET Core .NET 10 Minimal API, JWT, BCrypt, MongoDB.Driver
**Database:** MongoDB (Docker)

## Quick Start

### 1. Start MongoDB

```bash
docker compose up -d
```

### 2. Configure and run the .NET 10 backend

```bash
cd backend
dotnet restore
dotnet run
```

### 3. Install & Start Frontend (new terminal)

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
├── backend/           # ASP.NET Core .NET 10 REST API
│   ├── Program.cs        # API endpoints, auth and business logic
│   ├── Models.cs         # MongoDB document and request models
│   └── Gomibox.Api.csproj
└── docker-compose.yml
```

## Environment Variables

### Backend (.env or environment variables)

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
