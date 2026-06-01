# InvenTrack — Inventory & Order Management System

A full-stack inventory and order management system built with FastAPI (Python) and React 18.

## Tech Stack

| Layer      | Technology                              |
| ---------- | --------------------------------------- |
| Backend    | Python 3.11, FastAPI, SQLAlchemy, PostgreSQL |
| Frontend   | React 18, Vite, React Router v6, Axios  |
| Container  | Docker, docker-compose                  |

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
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Dashboard, Products, Customers, Orders
│   │   ├── services/      # API client (api.js)
│   │   └── styles/        # CSS with design system
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── vercel.json        # SPA rewrites for Vercel
│   └── package.json
├── render.yaml            # Render Blueprint (infra-as-code)
├── docker-compose.yml
├── .env.example
└── README.md
```

## Quick Start (Docker)

```bash
cp .env.example .env
docker compose up --build
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

## Manual Setup

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
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

- **SKU**: Must be unique across all products
- **Email**: Must be unique across all customers
- **Stock**: Quantity cannot go below 0
- **Orders**: Created with `pending` status; fails with 400 if any product has insufficient stock
- **Total**: Auto-calculated from product unit prices × quantities
- **Cancellation**: Restores product quantities; cannot cancel an already-cancelled order
- **Low Stock**: Products with quantity ≤ 10 are flagged on the dashboard

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

### Render (Backend) — Manual Steps

1. **Create a PostgreSQL database** on Render:
   - Go to **Dashboard → New → PostgreSQL**
   - Name: `inventrack-db`, DB: `inventrack`, User: `inventrack`
   - After creation, copy the **Internal Database URL**

2. **Create a Web Service**:
   - **Dashboard → New → Web Service**
   - Connect your GitHub repo (set root to `backend/`) or use **Existing Dockerfile**
   - **Name**: `inventrack-backend`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

3. **Add environment variables** in Render dashboard:
   - `DATABASE_URL` — paste the Internal Database URL from step 1
   - `ALLOWED_ORIGINS` — set to `https://your-frontend.vercel.app` (add after Vercel deploy)

4. **Deploy** — Render will build and start the service.

### Render (Backend) — Blueprint (auto)

A `render.yaml` is already included. Push your repo to GitHub, then:

1. Go to **Render Dashboard → New → Blueprint**
2. Connect your GitHub repo
3. Render auto-detects `render.yaml` and creates the database + web service

```yaml
# render.yaml (already in repo)
services:
  - type: web
    name: inventrack-backend
    runtime: python
    buildCommand: pip install -r requirements.txt
    startCommand: uvicorn app.main:app --host 0.0.0.0 --port $PORT
    envVars:
      - key: DATABASE_URL
        fromDatabase:
          name: inventrack-db
          property: connectionString
      - key: ALLOWED_ORIGINS
        value: https://inventrack-frontend.vercel.app

databases:
  - name: inventrack-db
    databaseName: inventrack
    user: inventrack
```

### Vercel (Frontend)

A `vercel.json` is already included for SPA routing. Deploy via:

**Option A — Vercel Dashboard (easier):**
1. Push your repo to GitHub
2. Go to **vercel.com → Add New → Project**
3. Import your GitHub repo
4. **Root Directory**: select `frontend/`
5. **Framework Preset**: Vite (auto-detected)
6. **Environment Variable**:
   - `VITE_API_URL` — set to `https://your-render-backend.onrender.com/api`
7. Click **Deploy**

**Option B — Vercel CLI:**
```bash
npm i -g vercel
cd frontend
vercel --prod
# Set VITE_API_URL when prompted
```

> **Important**: After deploying both, update `ALLOWED_ORIGINS` on Render to your Vercel domain (e.g. `https://inventrack-frontend.vercel.app`).
