const express = require("express");
const cors = require("cors");
require("dotenv").config();
const pool = require("./db");
const crypto = require("crypto");

const app = express();
app.use(cors());
app.use(express.json());

const authenticate = async (req, res, next) => {
  const api_key = req.headers["x-api-key"];
  if (!api_key) return res.status(401).json({ error: "No API key" });
  try {
    const result = await pool.query(
      "SELECT * FROM gateways WHERE api_key = $1",
      [api_key]
    );
    if (result.rows.length === 0)
      return res.status(403).json({ error: "Invalid API key" });
    req.gateway = result.rows[0];
    next();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// health check
app.get("/", (req, res) => res.json({ status: "ok" }));

app.get("/ping", (req, res) => res.send("ok"));

// get all readings
app.get("/readings", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM readings ORDER BY recorded_at DESC LIMIT 50"
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// post a new reading (gateway will call this)
app.post("/readings", async (req, res) => {
  const { gateway_id, temperature, humidity, recorded_at } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO readings (gateway_id, temperature, humidity, recorded_at) VALUES ($1, $2, $3, $4) RETURNING *",
      [gateway_id, temperature, humidity, recorded_at || new Date()]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// protect the readings POST endpoint - post readings with auth
app.post("/readings", authenticate, async (req, res) => {
  // existing code, but now use req.gateway.id instead of body gateway_id
  const { temperature, humidity, recorded_at } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO readings (gateway_id, temperature, humidity, recorded_at) VALUES ($1, $2, $3, $4) RETURNING *",
      [req.gateway.id, temperature, humidity, recorded_at || new Date()]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// get all gateways
app.get("/gateways", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM gateways");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//register gateway
app.post("/gateways/register", async (req, res) => {
  const { name } = req.body;
  const api_key = crypto.randomBytes(32).toString("hex");
  try {
    const result = await pool.query(
      "INSERT INTO gateways (name, api_key) VALUES ($1, $2) RETURNING *",
      [name, api_key]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
