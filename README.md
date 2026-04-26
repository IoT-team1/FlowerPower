# FlowerPower

IoT plant monitoring system — tracks temperature and humidity via sensor, gateway on Raspberry Pi or laptop, cloud dashboard.

## Live URLs

- Frontend: <https://flowerpower-bmv1.onrender.com>
- Backend API: <https://flowerpower-api-l3pv.onrender.com>

> Free tier services sleep after 15 min of inactivity — first load may take 30–60 seconds.

## Project structure

```
FlowerPower/
├── server/
│   ├── index.js               # Express app entry point
│   ├── db.js                  # MongoDB connection
│   ├── init-db.js             # One-time seed script for empty databases
│   ├── .env                   # Local secrets (never commit)
│   └── src/
│       ├── routes/            # Express routers
│       ├── abl/               # Application business logic
│       ├── dao/               # Database access layer
│       ├── models/            # Mongoose schemas
│       └── middleware/
│           └── auth.js        # Bearer token verification
├── client/                    # React + Vite frontend
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
4. **Important:** Atlas copies the string without a database name — make sure `/flowerpower` is included before the `?` as shown below.

> To seed and test against a throwaway database, replace `flowerpower` with `test` in the URI, run `node init-db.js`, then switch back to `flowerpower` when done. The `test` database is separate and won't affect real data.

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

| Method | Endpoint | Auth | Design command |
|--------|----------|------|----------------|
| GET | `/ping` | None | — |
| POST | `/gateways` | None | `gateway/create` |
| POST | `/gateways/login` | None | `gateway/login` |
| GET | `/gateways` | None | `gateway/list` |
| GET | `/gateways/:id` | None | `gateway/get` |
| PATCH | `/gateways/:id` | None | `gateway/update` |
| DELETE | `/gateways/:id` | None | `gateway/delete` |
| POST | `/plants` | None | `plant/create` |
| GET | `/plants` | None | `plant/list` (add `?gatewayId=` to filter) |
| GET | `/plants/:id` | None | `plant/get` |
| PATCH | `/plants/:id` | None | `plant/update` |
| DELETE | `/plants/:id` | None | `plant/delete` |
| POST | `/measurements` | Bearer token | `measurement/create` |
| GET | `/measurements` | None | `measurement/list` (add `?gatewayId=` to filter) |
| DELETE | `/measurements/old` | None | `measurement/deleteOld` (add `?days=30`) |
| GET | `/alerts` | None | `alert/list` (add `?resolved=true` for all) |
| PATCH | `/alerts/:id` | None | `alert/update` |

### Gateway auth flow

Gateways authenticate in two steps:

**1. Register** (once, on first boot):

```bash
curl -X POST http://localhost:3001/gateways \
  -H "Content-Type: application/json" \
  -d '{"name": "RPi Gateway 1"}'
```

Returns `device_secret` — store this permanently on the gateway device.

**2. Login** (to get a session token before sending data):

```bash
curl -X POST http://localhost:3001/gateways/login \
  -H "Content-Type: application/json" \
  -d '{"id": "GATEWAY_ID", "device_secret": "YOUR_DEVICE_SECRET"}'
```

Returns `accessToken` — use this as a Bearer token for submitting measurements.

### Submit a measurement

```bash
curl -X POST http://localhost:3001/measurements \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
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
RPi first boot → POST /gateways {"name": "RPi Gateway 1"}
             ← receives device_secret, stored permanently in Node-RED

On each cycle → POST /gateways/login {"id": "...", "device_secret": "..."}
             ← receives accessToken

Every 5 min  → POST /measurements  Authorization: Bearer <accessToken>
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
