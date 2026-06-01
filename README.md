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
│   └── package.json
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

### Render (Backend)

1. Create a new **Web Service** on Render
2. Set **Build Command**: `pip install -r requirements.txt`
3. Set **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Add environment variables from the table above (use a managed PostgreSQL)
5. Set `ALLOWED_ORIGINS` to your frontend domain

### Vercel (Frontend)

This project uses Vite, which requires client-side rendering (not SSR). Deploy as a SPA:

1. Install Vercel CLI: `npm i -g vercel`
2. Set **Framework Preset**: Vite
3. Set `VITE_API_URL` to your Render backend URL
4. Add a `vercel.json` rewrite rule for SPA fallback:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

Alternatively, deploy directly from the Vercel dashboard by importing the `frontend/` directory.
