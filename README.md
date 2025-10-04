# LitVerse

A lightweight **book-review app** (frontend + backend).  

- **Frontend:** Vite + React + TypeScript + Tailwind CSS  
- **Backend:** Node.js (ESM) + Express + Mongoose (MongoDB)  

This project allows users to browse, review, and manage books with JWT-based authentication.  

---

## Table of Contents

- [Project Structure](#project-structure)  
- [Features](#features)  
- [Prerequisites](#prerequisites)  
- [Environment Variables](#environment-variables)  
- [Local Development](#local-development)  
- [Production Build](#production-build)  
- [Deployment: Render + Vercel](#deployment-render--vercel)  
- [Postman Collection](#postman-collection)  
- [Health Checks & Smoke Tests](#health-checks--smoke-tests)  
- [Security & Production Checklist](#security--production-checklist)  
- [Troubleshooting](#troubleshooting)  
- [Next Steps & Improvements](#next-steps--improvements)  
- [Commands Summary](#commands-summary)  
- [License](#license)  

---

## Project Structure

```
Root/
├─ Server/                  # Backend (Node + Express + MongoDB)
│  ├─ src/
│  │  ├─ index.mjs         # Entry point
│  │  ├─ controllers/      # Route controllers (books, reviews, auth, profile)
│  │  ├─ routes/           # API routes
│  │  ├─ models/           # Mongoose schemas
│  │  └─ middleware/       # Auth & utility middleware
├─ Client/                  # Frontend (React + Vite + Tailwind)
│  ├─ src/                 # React source (pages, components)
│  ├─ .env                 # Vite environment variables (VITE_API_URL)
│  └─ dist/                # Production build output
├─ postman_collection.json
└─ README.md
```

---

## Features

- CRUD for books (create/update/delete protected)  
- Add/update/delete reviews (protected)  
- Book list with:
  - Search by title/author  
  - Filter by genre  
  - Sort by published year or average rating  
  - Pagination  
- View book details including reviews & average rating  
- JWT-based user authentication (signup/login)  
- Health check endpoint: `/health`  

---

## Prerequisites

- Node.js 18+  
- pnpm (or npm/yarn)  
- MongoDB (Atlas, managed, or local)  
- Git  

Install `pnpm` if not installed:

```bash
npm install -g pnpm
```

---

## Environment Variables

### Backend (Server/)

Create `Server/.env`:

```env
MONGO_URI=<your_mongodb_uri>
JWT_SECRET=<your_jwt_secret>
NODE_ENV=development
PORT=5000
ALLOWED_ORIGINS=https://your-frontend.vercel.app,http://localhost:5173
```

**Notes:**

- `ALLOWED_ORIGINS` is optional for CORS; in production, include your frontend URL.
- Keep `JWT_SECRET` safe.

### Frontend (Client/)

Create `Client/.env`:

```env
VITE_API_URL=https://your-backend-url.onrender.com
```

For Vercel, set `VITE_API_URL` in project environment variables.

---

## Local Development

### Backend (Server)

```bash
cd Server
pnpm install
pnpm run start:dev
```

Logs show MongoDB connection & server port.

**Endpoints:**

- `GET /health` — health check
- `POST /api/auth/signup` — register
- `POST /api/auth/login` — login
- `GET /api/books` — list books (query params: q, genre, sort, page)
- `POST /api/books` — create book (protected)
- `GET /api/books/:id` — book details + reviews
- `PUT /api/books/:id` — update book (protected)
- `DELETE /api/books/:id` — delete book (protected)
- `GET /api/reviews/:bookId` — list reviews
- `POST /api/reviews/:bookId` — add review (protected)
- `PUT /api/reviews/review/:id` — update review (protected)
- `DELETE /api/reviews/review/:id` — delete review (protected)
- `GET /api/profile` — profile + user books/reviews (protected)

**Protected endpoints require:** `Authorization: Bearer <JWT>`

### Frontend (Client)

```bash
cd Client
pnpm install
pnpm run dev
```

Open `http://localhost:5173`

Calls API at `VITE_API_URL`. Make sure `VITE_API_URL` points to local or deployed backend.

---

## Production Build

### Frontend

```bash
cd Client
pnpm run build     # outputs to dist/
pnpm run preview   # optional: preview production build locally
```

### Backend

Start with production environment:

```bash
cd Server
NODE_ENV=production MONGO_URI=<your_mongo_uri> JWT_SECRET=<secret> pnpm start
```

---

## Deployment: Render (Backend) + Vercel (Frontend)

### Render (Backend)

1. Create a new **Web Service** on Render.
2. Connect GitHub repo and set root directory to `Server`.
3. **Start command:** `npm start`
4. **Environment variables:** `MONGO_URI`, `JWT_SECRET`, `NODE_ENV=production`, `ALLOWED_ORIGINS`
5. **Health check path:** `/health`
6. Backend URL example: `https://litverse-backend.onrender.com`

### Vercel (Frontend)

1. Create new Vercel Project, root directory: `Client`.
2. Set environment variable: `VITE_API_URL=<Render-backend-url>`
3. **Build command:** `pnpm run build`
4. **Output directory:** `dist`
5. Deploy
6. Frontend URL example: `https://litverse-frontend.vercel.app`

### Optional: Handle React Router 404s on Vercel

Add `vercel.json` in `Client/`:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

Ensures frontend routes load correctly on refresh.

---

## Postman Collection

File: `postman_collection.json`

Includes requests for:

- Auth
- Books
- Reviews
- Profile

`baseUrl` variable can point to local or Render backend. Save token to `token` variable for protected requests.

---

## Health Checks & Smoke Tests

```bash
# Health
curl -i https://litverse-backend.onrender.com/health

# List books
curl -i 'https://litverse-backend.onrender.com/api/books?q=&genre=&sort=year&page=1'
```

---

## Security & Production Checklist

- Strong `JWT_SECRET`
- Restrict `ALLOWED_ORIGINS` to frontend domain
- HTTPS (Render & Vercel provide TLS)
- Optional middleware:
  - `helmet` — secure headers
  - `compression` — gzipping
  - `express-rate-limit` — protect auth endpoints
- MongoDB: dedicated DB user, IP whitelist / VPC peering
- Enable logging/monitoring

---

## Troubleshooting

- **CORS errors:** check `ALLOWED_ORIGINS`
- **Frontend API not working:** check `VITE_API_URL` at build time
- **MongoDB connection failed:** check `MONGO_URI` and network access
- **Auth issues:** verify JWT token in headers

---

## Next Steps & Improvements

- CI/CD with GitHub Actions
- Docker + docker-compose for local full-stack testing
- Logging & monitoring integration
- UI improvements: star ratings, pagination, search debounce
- Add backend security middleware (helmet, compression, rate-limit)

---

## Commands Summary

### Frontend:

```bash
cd Client
pnpm install
pnpm run dev        # dev server
pnpm run build      # production build
pnpm run preview    # preview build
```

### Backend:

```bash
cd Server
pnpm install
pnpm run start:dev  # dev with nodemon

# Production
MONGO_URI="<uri>" JWT_SECRET="secret" NODE_ENV=production pnpm start
```

---

## License

MIT License
