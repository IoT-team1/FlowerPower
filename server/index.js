const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { v4: uuidv4 } = require("uuid");
const { Gateway, Measurement, Plant, Alert } = require("./db");

const app = express();
app.use(cors());
app.use(express.json());

const authenticate = async (req, res, next) => {
  const apiKey = req.headers["x-api-key"];
  if (!apiKey) return res.status(401).json({ error: "No API key" });
  try {
    const gateway = await Gateway.findOne({ apiKey });
    if (!gateway) return res.status(403).json({ error: "Invalid API key" });
    req.gateway = gateway;
    next();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// health check
app.get("/", (req, res) => res.json({ status: "ok" }));
app.get("/ping", (req, res) => res.send("ok"));

// --- Gateways ---

app.get("/gateways", async (req, res) => {
  try {
    res.json(await Gateway.find().lean());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/gateways/register", async (req, res) => {
  const { name } = req.body;
  try {
    const gateway = await Gateway.create({ name, apiKey: uuidv4() });
    res.json(gateway);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// mark gateway online/offline
app.patch("/gateways/:id/status", async (req, res) => {
  const { status } = req.body;
  try {
    const gateway = await Gateway.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).lean();
    if (!gateway) return res.status(404).json({ error: "Gateway not found" });
    res.json(gateway);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Measurements ---

app.get("/measurements", async (req, res) => {
  try {
    const measurements = await Measurement.find()
      .sort({ timestamp: -1 })
      .limit(50)
      .lean();
    res.json(measurements);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/measurements/:gatewayId", async (req, res) => {
  try {
    const measurements = await Measurement.find({ gatewayId: req.params.gatewayId })
      .sort({ timestamp: -1 })
      .limit(50)
      .lean();
    res.json(measurements);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// submit measurement from authenticated gateway
app.post("/measurements", authenticate, async (req, res) => {
  const { temperature, humidity, timestamp } = req.body;
  try {
    const measurement = await Measurement.create({
      gatewayId: req.gateway._id,
      temperature,
      humidity,
      timestamp: timestamp || new Date(),
    });
    await Gateway.findByIdAndUpdate(req.gateway._id, {
      status: "online",
      lastSync: new Date(),
    });
    res.json(measurement);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Plants ---

app.get("/plants", async (req, res) => {
  try {
    res.json(await Plant.find().lean());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/plants", async (req, res) => {
  const { gatewayId, name, thresholds } = req.body;
  try {
    const plant = await Plant.create({ gatewayId, name, thresholds });
    res.json(plant);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch("/plants/:id", async (req, res) => {
  try {
    const plant = await Plant.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    }).lean();
    if (!plant) return res.status(404).json({ error: "Plant not found" });
    res.json(plant);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/plants/:id", async (req, res) => {
  try {
    await Plant.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Alerts ---

app.get("/alerts", async (req, res) => {
  const filter = req.query.resolved === "true" ? {} : { isResolved: false };
  try {
    const alerts = await Alert.find(filter).sort({ timestamp: -1 }).lean();
    res.json(alerts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/alerts", async (req, res) => {
  const { plantId, message, level, recommendation } = req.body;
  try {
    const alert = await Alert.create({ plantId, message, level, recommendation });
    res.json(alert);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// resolve an alert
app.patch("/alerts/:id/resolve", async (req, res) => {
  try {
    const alert = await Alert.findByIdAndUpdate(
      req.params.id,
      { isResolved: true },
      { new: true }
    ).lean();
    if (!alert) return res.status(404).json({ error: "Alert not found" });
    res.json(alert);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
