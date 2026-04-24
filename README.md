# FlowerPower

IoT plant monitoring system — tracks temperature and humidity via sensor, gateway on Raspberry Pi or laptop, cloud dashboard.

## Live URLs

- Frontend: <https://flowerpower-bmv1.onrender.com>
- Backend API: <https://flowerpower-api-l3pv.onrender.com>

> Free tier services sleep after 15 min of inactivity — first load may take 30–60 seconds.

## Project structure

```
FlowerPower/
├── server/         # Express.js API + Mongoose models
│   ├── index.js    # API routes
│   ├── db.js       # MongoDB connection and schemas
│   ├── init-db.js  # One-time seed script for empty databases
│   └── .env        # Local secrets (never commit)
├── client/         # React + Vite frontend
│   └── src/
│       └── App.jsx
└── README.md
```

## Prerequisites

- Node.js LTS — <https://nodejs.org>
- A MongoDB database (Atlas cluster or local install)

---

## Local setup

### 1. Clone and install

```bash
git clone https://github.com/your-org/FlowerPower.git
cd FlowerPower
npm install          # installs concurrently (root)
cd server && npm install
cd ../client && npm install
```

### 2. Create `server/.env`

```
MONGODB_URI=your_mongodb_connection_string
PORT=3001
```

Pick one of the two options below to get a connection string.

---

### Option A — MongoDB Atlas (shared team database)

1. Go to [MongoDB Atlas](https://cloud.mongodb.com) and open your cluster.
2. Click **Connect → Drivers**, copy the connection string and replace `<password>`.
3. Make sure your IP is whitelisted under **Network Access** (or add `0.0.0.0/0` for development).

Your `.env` should look like:

```
MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/flowerpower?appName=Cluster0
PORT=3001
```

---

### Option B — Local MongoDB (offline development)

Install and start MongoDB:

```bash
brew install mongodb-community
brew services start mongodb-community
```

Your `.env` should look like:

```
MONGODB_URI=mongodb://localhost:27017/flowerpower
PORT=3001
```

---

### 3. Seed the database (first time only)

**Skip this if the team Atlas database already has data** — running it again adds duplicate records.

Only run this against a completely empty database:

```bash
cd server
node init-db.js
```

### 4. Run locally

From the repo root, start both server and client in one command:

```bash
cd ..       # back to repo root if needed
npm run dev
```

Or run them separately:

```bash
# terminal 1
cd server && npm run dev    # http://localhost:3001

# terminal 2
cd client && npm run dev    # http://localhost:5173
```

The frontend automatically connects to `http://localhost:3001`. To point it at a different backend, set `VITE_API_URL` in `client/.env.local`:

```
VITE_API_URL=https://your-backend.onrender.com
```

---

## API endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/ping` | None | Health check |
| GET | `/measurements` | None | Last 50 measurements |
| POST | `/measurements` | API key | Submit new measurement from gateway |
| GET | `/measurements/:gatewayId` | None | Last 50 for a specific gateway |
| GET | `/gateways` | None | List all gateways |
| POST | `/gateways/register` | None | Register a new gateway |
| PATCH | `/gateways/:id/status` | None | Update gateway online/offline status |
| GET | `/plants` | None | List all plants |
| POST | `/plants` | None | Create a plant |
| PATCH | `/plants/:id` | None | Update plant name or thresholds |
| DELETE | `/plants/:id` | None | Remove a plant |
| GET | `/alerts` | None | List active alerts (add `?resolved=true` for all) |
| POST | `/alerts` | None | Create an alert |
| PATCH | `/alerts/:id/resolve` | None | Mark alert as resolved |

### Register a gateway

```bash
curl -X POST http://localhost:3001/gateways/register \
  -H "Content-Type: application/json" \
  -d '{"name": "RPi Gateway 1"}'
```

Response includes `apiKey` — store this on the gateway device.

### Submit a measurement

```bash
curl -X POST http://localhost:3001/measurements \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_API_KEY" \
  -d '{"temperature": 22.5, "humidity": 58.3}'
```

### Create a plant

```bash
curl -X POST http://localhost:3001/plants \
  -H "Content-Type: application/json" \
  -d '{
    "gatewayId": "GATEWAY_OBJECT_ID",
    "name": "Ficus",
    "thresholds": { "minTemp": 18, "maxTemp": 28, "minHum": 40, "maxHum": 70 }
  }'
```

---

## Gateway flow (Node-RED on Raspberry Pi / laptop)

```
RPi first boot → POST /gateways/register {"name": "RPi Gateway 1"}
             ← receives apiKey, stored locally in Node-RED

Every 5 min  → POST /measurements  x-api-key: <stored key>
                                   {"temperature": 22.5, "humidity": 58.3}
             ← 200 OK
```

---

## Cloud deployment

### Backend — Render Web Service

1. Connect your GitHub repo in [Render](https://render.com).
2. Set **Root directory** to `server`, **Build command** to `npm install`, **Start command** to `node index.js`.
3. Add environment variables: `MONGODB_URI`, `PORT` (Render sets this automatically), `NODE_ENV=production`.

### Frontend — Render Static Site

1. Set **Root directory** to `client`, **Build command** to `npm install && npm run build`, **Publish directory** to `dist`.
2. Add environment variable: `VITE_API_URL=https://your-backend.onrender.com`.

### Database — MongoDB Atlas

- Free M0 cluster, no expiry.
- Under **Network Access**, add `0.0.0.0/0` so Render's dynamic IPs can connect.
