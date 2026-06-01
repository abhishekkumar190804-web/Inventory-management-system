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

## Deployment (Free Tier)

> Blueprint (`render.yaml`) requires a paid Render plan. Use the manual steps below for the free tier.

### Render (Backend)

**Step 1 — Create a free PostgreSQL database**

Go to **Render Dashboard → New → PostgreSQL** and fill in:

| Field        | Value               |
| ------------ | ------------------- |
| Name         | `inventrack-db`     |
| Database     | `inventrack`        |
| User         | `inventrack`        |
| Plan         | **Free**            |

After creation, copy the **Internal Database URL** (starts with `postgresql://...`).

**Step 2 — Create a free Web Service**

Go to **Render Dashboard → New → Web Service** and connect your GitHub repo.

| Field            | Value                                      |
| ---------------- | ------------------------------------------ |
| Name             | `inventrack-backend`                       |
| Root Directory   | `backend`                                  |
| Runtime          | **Python 3**                               |
| Build Command    | `pip install -r requirements.txt`          |
| Start Command    | `uvicorn app.main:app --host 0.0.0.0 --port $PORT` |
| Plan             | **Free**                                   |

**Step 3 — Add environment variables**

In the Web Service dashboard → **Environment** tab, add:

| Key                | Value                                            |
| ------------------ | ------------------------------------------------ |
| `DATABASE_URL`     | Paste the Internal Database URL from Step 1      |
| `ALLOWED_ORIGINS`  | `https://your-frontend.vercel.app` (add later)   |

Click **Deploy**. Render will build and start your backend for free.

> The free web service spins down after 15 min of inactivity and wakes on request. That's fine for demo/testing.

### Vercel (Frontend)

A `vercel.json` is already included for SPA routing.

1. Go to **vercel.com → Add New → Project**
2. Import your GitHub repo
3. **Root Directory**: select `frontend/`
4. **Framework Preset**: Vite (auto-detected)
5. Add environment variable:
   - `VITE_API_URL` = `https://your-backend.onrender.com/api`
6. Click **Deploy** (free tier, no credit card needed)

> After both are live, update `ALLOWED_ORIGINS` on Render to your Vercel domain (e.g. `https://inventrack-frontend.vercel.app`).
