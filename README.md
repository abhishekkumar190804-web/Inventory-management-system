# InvenTrack — Inventory & Order Management System

A full-stack inventory and order management system built with **FastAPI** (Python) and **React 18**. Track products, manage customers, and process orders with automatic stock validation.

## Live Demo

| Service    | URL                                                            |
| ---------- | -------------------------------------------------------------- |
| Frontend   | https://frontend-abshk-s-projects.vercel.app                   |
| Backend    | https://inventrack-backend-ujyy.onrender.com                   |
| API Docs   | https://inventrack-backend-ujyy.onrender.com/docs              |
| Health     | https://inventrack-backend-ujyy.onrender.com/api/health        |

## Features

- **Dashboard** — View total products, customers, orders, and low-stock alerts
- **Products** — CRUD with unique SKU enforcement and stock tracking
- **Customers** — Add/delete with unique email validation
- **Orders** — Create orders with line items; auto-calculates totals; cancels restore stock
- **Low Stock Alerts** — Products with quantity ≤ 10 flagged on dashboard
- **Error Handling** — User-friendly toast notifications for failures, silent handling of background network issues

## Tech Stack

| Layer      | Technology                                                   |
| ---------- | ------------------------------------------------------------ |
| Backend    | Python 3.11+, FastAPI, SQLAlchemy 2.0, Pydantic 2, PostgreSQL |
| Frontend   | React 18, Vite, React Router v6, Axios, CSS design system    |
| Container  | Docker, Docker Compose                                       |
| Cloud      | Render (backend), Vercel (frontend), Docker Hub (images)     |

## Docker Images

Docker images are published on Docker Hub under the `6306706055` namespace:

| Image                                   | Pull Command                                      |
| --------------------------------------- | ------------------------------------------------- |
| Backend                                 | `docker pull 6306706055/inventrack-backend`       |
| Frontend                                | `docker pull 6306706055/inventrack-frontend`      |

```bash
# Run locally with Docker Compose
docker compose up --build
```

## Project Structure

```
inventrack/
├── backend/
│   ├── app/
│   │   ├── main.py        # FastAPI app & routes
│   │   ├── models.py      # SQLAlchemy models
│   │   ├── schemas.py     # Pydantic schemas
│   │   ├── crud.py        # Business logic
│   │   └── database.py    # DB connection
│   ├── Dockerfile
│   ├── render.yaml        # Render deployment config
│   └── requirements.txt
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Dashboard, Products, Customers, Orders
│   │   ├── services/      # API client (api.js)
│   │   └── styles/        # CSS with design system
│   ├── Dockerfile
│   ├── nginx.conf         # Nginx config for Docker
│   └── package.json
├── docker-compose.yml
├── .env.example
└── README.md
```

## Quick Start (Docker)

```bash
# Clone the repo
git clone https://github.com/abhishekkumar190804-web/Inventory-management-system.git
cd Inventory-management-system

# Copy environment file
cp .env.example .env

# Start all services
docker compose up --build
```

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000
- **API Docs (Swagger):** http://localhost:8000/docs

## Manual Setup

### Backend

```bash
cd backend
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS / Linux:
source venv/bin/activate

pip install -r requirements.txt

# Set DATABASE_URL in environment
# e.g. DATABASE_URL=postgresql://user:pass@localhost:5432/inventrack

uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend
npm install
VITE_API_URL=http://localhost:8000/api npm run dev
```

## API Reference

| Method | Endpoint                | Description                          |
| ------ | ----------------------- | ------------------------------------ |
| GET    | /api/health             | Health check                         |
| GET    | /api/dashboard          | Dashboard stats & low stock products |
| GET    | /api/products           | List all products                    |
| POST   | /api/products           | Create product (unique SKU)          |
| GET    | /api/products/:id       | Get product by ID                    |
| PUT    | /api/products/:id       | Update product                       |
| DELETE | /api/products/:id       | Delete product                       |
| GET    | /api/customers          | List all customers                   |
| POST   | /api/customers          | Create customer (unique email)       |
| DELETE | /api/customers/:id      | Delete customer                      |
| GET    | /api/orders             | List all orders                      |
| POST   | /api/orders             | Create order (validates stock)       |
| GET    | /api/orders/:id         | Get order with items                 |
| DELETE | /api/orders/:id         | Cancel order (restores stock)        |

## Business Rules

- **SKU** — Must be unique across all products
- **Email** — Must be unique across all customers
- **Stock** — Quantity cannot go below 0
- **Orders** — Created with `pending` status; fails with 400 if any product has insufficient stock
- **Total** — Auto-calculated from product unit prices × quantities
- **Cancellation** — Restores product quantities; cannot cancel an already-cancelled order
- **Low Stock** — Products with quantity ≤ 10 are flagged on the dashboard

## Environment Variables

| Variable           | Description              | Default                        |
| ------------------ | ------------------------ | ------------------------------ |
| POSTGRES_USER      | PostgreSQL user          | inventrack                     |
| POSTGRES_PASSWORD  | PostgreSQL password      | inventrack_pass                |
| POSTGRES_DB        | PostgreSQL database name | inventrack                     |
| DATABASE_URL       | Full database connection | postgresql://...               |
| ALLOWED_ORIGINS    | CORS origins (comma sep) | http://localhost:5173,...      |
| VITE_API_URL       | Backend URL for frontend | http://localhost:8000/api      |

## Deployment

### Render (Backend)

The backend is deployed at **https://inventrack-backend-ujyy.onrender.com**.

1. Create a new **Web Service** on Render from your GitHub repo
2. Set **Root Directory** to `backend`
3. Set **Runtime** to `Python 3`
4. Set **Build Command**: `pip install -r requirements.txt`
5. Set **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
6. Add environment variables (use a managed PostgreSQL)
7. Set `ALLOWED_ORIGINS` to your frontend domain (e.g. `https://frontend-abshk-s-projects.vercel.app`)

> **Note:** Render's default Python runtime may be newer than 3.11. If you encounter build failures with `pydantic`, `sqlalchemy`, or `psycopg2-binary`, upgrade them to the latest versions which support Python 3.14.

### Vercel (Frontend)

The frontend is deployed at **https://frontend-abshk-s-projects.vercel.app**.

This project uses Vite (client-side rendering). Deploy as a SPA:

1. Install Vercel CLI: `npm i -g vercel`
2. Set **Framework Preset**: Vite
3. Set `VITE_API_URL` to your Render backend URL (e.g. `https://inventrack-backend-ujyy.onrender.com/api`)
4. Add a `vercel.json` rewrite rule for SPA fallback:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

Alternatively, deploy directly from the Vercel dashboard by importing the `frontend/` directory.

### Docker Hub

Images are available under the `6306706055` namespace:

```bash
docker pull 6306706055/inventrack-backend:latest
docker pull 6306706055/inventrack-frontend:latest
```

## Local Development

```bash
# Start PostgreSQL and backend
docker compose up --build
```

The backend auto-reloads on code changes. The frontend uses Vite's HMR for instant feedback.
