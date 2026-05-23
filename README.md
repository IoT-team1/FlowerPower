# FlowerPower

IoT plant monitoring system — tracks temperature and humidity via sensor, gateway on Raspberry Pi or laptop, cloud dashboard.

## Live URLs

- App: <https://flowerpower-api-l3pv.onrender.com>
- ~~Frontend (retired): <https://flowerpower-bmv1.onrender.com>~~
- ~~Backend API (direct): <https://flowerpower-api-l3pv.onrender.com>~~

> Free tier services sleep after 15 min of inactivity — first load may take 30–60 seconds.

## Project structure

```
FlowerPower/
├── server/
│   ├── index.js               # Express app entry point
│   ├── db.js                  # MongoDB connection
│   ├── init-db.js             # One-time seed script for empty databases
│   ├── seed-data.json         # Sample data used by init-db.js
│   ├── .env                   # Local secrets (never commit)
│   └── src/
│       ├── routes/            # Express routers (auth, gateway, plant, measurement, alert, sse)
│       ├── abl/               # Application business logic
│       ├── dao/               # Database access layer
│       ├── models/            # Mongoose schemas
│       ├── middleware/
│       │   ├── auth.js        # Bearer token verification (used by /measurements)
│       │   └── requireAuth.js # Session auth guard (used by /plants, /alerts, /sse)
│       └── sevises/
│           └── sseManager.js  # Server-sent events broadcasting
├── client/                    # React + Vite frontend
│   └── src/
│       ├── pages/             # DevicesPage, DeviceDetailPage, HistoryPage, LoginPage
│       ├── components/        # alerts, auth, devices, history, layout, measurements
│       ├── hooks/             # useAlerts, useAuth, useMeasurements, usePlants, useSse, …
│       ├── api/               # Axios wrappers per resource
│       ├── store/             # Zustand alert store
│       ├── services/          # sse.service.js
│       └── utils/             # formatters, stats, thresholds
├── gateway/
│   ├── gw.py                  # Python gateway — reads Arduino via serial, buffers in SQLite, sends to API
│   ├── config.json            # Gateway config (backendUrl, gatewayId, deviceSecret, ports, intervals)
│   └── requirements.txt       # Python dependencies
├── node/
│   └── sensor_node.ino        # Arduino sketch — reads moisture (A0) + DHT11, outputs JSON over serial
├── render.yaml                # Render deployment config
└── README.md
```

## Prerequisites

- Node.js LTS — <https://nodejs.org>
- A MongoDB database (Atlas cluster or local install)
- Google OAuth credentials (for dashboard login) — create a project at <https://console.cloud.google.com>

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
SESSION_SECRET=a_long_random_string
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
CLIENT_URL=http://localhost:5173
SERVER_URL=http://localhost:3001
ALLOWED_EMAILS=you@example.com,colleague@example.com
```

`ALLOWED_EMAILS` is a comma-separated list of Google accounts permitted to log in. Leave it unset to allow any Google account.

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

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/ping` | None | Health check |
| POST | `/gateways` | None | Register a new gateway |
| POST | `/gateways/login` | None | Authenticate device, returns Bearer token |
| GET | `/gateways` | None | List all gateways |
| GET | `/gateways/:id` | None | Get gateway details |
| PATCH | `/gateways/:id` | None | Update gateway metadata or status |
| DELETE | `/gateways/:id` | None | Remove a gateway |
| POST | `/plants` | Session | Create a plant |
| GET | `/plants` | Session | List plants (add `?gatewayId=` to filter) |
| GET | `/plants/:id` | Session | Get plant details |
| PATCH | `/plants/:id` | Session | Update plant |
| DELETE | `/plants/:id` | Session | Delete plant |
| POST | `/measurements` | Bearer token | Submit a measurement from gateway |
| GET | `/measurements` | None | List measurements (add `?gatewayId=` to filter) |
| DELETE | `/measurements/old` | None | Delete old measurements (add `?days=30`) |
| GET | `/alerts` | Session | List alerts (add `?resolved=true` for all) |
| PATCH | `/alerts/:id` | Session | Update alert |
| GET | `/sse` | Session | Server-sent events stream |
| GET | `/auth/google` | None | Start Google OAuth login |
| GET | `/auth/google/callback` | None | Google OAuth callback |
| GET | `/auth/me` | None | Get current logged-in user |
| GET | `/auth/logout` | None | Log out |

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

## Gateway flow (Python on Raspberry Pi / laptop)

The gateway script (`gateway/gw.py`) reads sensor data from an Arduino over serial, buffers raw readings in a local SQLite database, averages them on a configurable interval, and sends the averaged measurements to the cloud API.

```
RPi first boot → POST /gateways {"name": "RPi Gateway 1"}
             ← receives device_secret — store in config.json permanently

Every N seconds → reads Arduino JSON over serial
               → saves raw reading to local SQLite (offline-safe buffer)

Every M seconds → averages buffered raw readings
               → POST /gateways/login  {"id": "...", "device_secret": "..."}
               ← receives accessToken (cached in memory, refreshed before expiry)
               → POST /measurements  Authorization: Bearer <accessToken>
                                     {"moisture": 42.0, "temperature": 22.5, "humidity": 58.3}
               ← 200 OK — averaged record deleted from local buffer
```

Configure intervals in `gateway/config.json`:

```json
{
  "backendUrl": "https://your-api.onrender.com",
  "gatewayId": "GATEWAY_OBJECT_ID",
  "deviceSecret": "YOUR_DEVICE_SECRET",
  "arduinoPort": "/dev/ttyACM0",
  "baudRate": 9600,
  "measurementIntervalSec": 10,
  "averagingIntervalSec": 120
}
```

Install dependencies and run:

```bash
cd gateway
pip install -r requirements.txt
python gw.py
```

## Sensor node (Arduino)

`node/sensor_node.ino` reads a capacitive moisture sensor on pin `A0` and a DHT11 temperature/humidity sensor on pin `4`, then outputs a JSON line over serial every cycle:

```json
{"MoisturePercent": 55.2, "Temperature": 22.5, "Humidity": 58.0}
```

The gateway reads this JSON and stores it locally before forwarding to the API.

## Cloud deployment

### Render Web Service (serves both API and frontend)

1. Connect your GitHub repo in [Render](https://render.com).
2. Set **Root directory** to `.` (repo root), **Build command** to `cd client && npm install && npm run build && cd ../server && npm install`, **Start command** to `node server/index.js`.
3. Add environment variables: `MONGODB_URI`, `NODE_ENV=production`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `SESSION_SECRET`, `SERVER_URL=https://your-service.onrender.com`.

### ~~Frontend — Render Static Site (retired)~~

~~Previously deployed as a separate static site. Retired in favour of the Express server serving the built React app from the same domain, which is required for session cookies to work across Safari and Firefox.~~

### Database — MongoDB Atlas

- Free M0 cluster, no expiry.
- Under **Network Access**, add `0.0.0.0/0` so Render's dynamic IPs can connect.
