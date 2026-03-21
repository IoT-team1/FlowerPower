# FlowerPower

IoT plant monitoring system — tracks temperature and humidity via sensor, Gateway on Raspberry Pi/Laptop, cloud dashboard.

## Live URLs

- Frontend: <https://flowerpower-bmv1.onrender.com>
- Backend API: <https://flowerpower-api-l3pv.onrender.com>

> Note: Free tier services sleep after 15 min of inactivity — first load may take 30-60 seconds.
> Cron job on /ping endpoint every 15 mins

## Project Structure

```
plant-monitoring/
├── server/    # Express.js API (Node.js + Express)
├── client/    # React frontend (Vite)
├── schema.sql # Database schema
└── README.md
```

## Running locally

### Prerequisites

- Node.js LTS — <https://nodejs.org>
- PostgreSQL client (for DB setup) — `brew install libpq`
- PostgreSQL connection string (get from team — never commit this)

## Database setup

### Option A — Supabase (shared team database)
Database is hosted on Supabase (free tier, no expiry).

Run once to initialise a fresh database:
```bash
psql -f server/schema.sql postgresql://postgres:[PASSWORD]@db.xxxx.supabase.co:5432/postgres
```

To connect and inspect manually:
```bash
psql postgresql://postgres:[PASSWORD]@db.xxxx.supabase.co:5432/postgres
```

Get the full connection string from the team.

### Option B — Local PostgreSQL (offline development)
Install and start PostgreSQL:
```bash
brew install postgresql@15
brew services start postgresql@15
```

Create and initialise local database:
```bash
createdb flowerpower
psql -f server/schema.sql postgresql://localhost/flowerpower
```

Connect to inspect manually:
```bash
psql postgresql://localhost/flowerpower
```

Then set your local `.env` with development:
```
DATABASE_URL=postgresql://localhost/flowerpower
PORT=3001
NODE_ENV=development
```

## Running locally

### Environment variables

Create `server/.env` (ask team for the connection string):

```
DATABASE_URL=your_external_postgres_connection_string
PORT=3001
```

### Backend

```bash
cd server
npm install
npm run dev        # runs on http://localhost:3001
```

### Frontend

```bash
cd client
npm install
npm run dev        # runs on http://localhost:5173
```

### Run both at once (from root)

```bash
npm install
npm run dev
```

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/ping` | None | Health check |
| GET | `/readings` | None | Last 50 readings |
| POST | `/readings` | API key | Submit new reading |
| GET | `/gateways` | None | List gateways |
| POST | `/gateways/register` | None | Register new gateway |

### Registering a gateway

```bash
curl -X POST https://flowerpower-api-l3pv.onrender.com/gateways/register \
  -H "Content-Type: application/json" \
  -d '{"name": "RPi Gateway 1"}'
```

Returns an `api_key` — store this on the gateway device.

### Sending a reading

```bash
curl -X POST https://flowerpower-api-l3pv.onrender.com/readings \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_API_KEY" \
  -d '{"temperature": 22.5, "humidity": 58.3}'
```

## Gateway flow (Node-RED on Raspberry Pi/Laptop)

```
RPi first boot → POST /gateways/register {name: "RPi Gateway 1"}
             ← receives api_key, stores it locally in Node-RED

Every 5 min  → POST /readings with header x-api-key: <stored key>
             ← 200 OK, gateway deletes local SQLite record
```

## Deployment

- Backend: Render Web Service (Frankfurt)
- Database: Supabase PostgreSQL (free tier, no expiry)
- Frontend: Render Static Site (Global CDN)