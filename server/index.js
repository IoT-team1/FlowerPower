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
// gateway/create
app.post("/gateways", async (req, res) => {
  const { name } = req.body;
  try {
    const gateway = await Gateway.create({ name, apiKey: uuidv4() });
    res.json(gateway);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// gateway/get
app.get("/gateways/:id", async (req, res) => {
  try {
    const gateway = await Gateway.findById(req.params.id).lean();
    if (!gateway) return res.status(404).json({ error: "Gateway not found" });
    res.json(gateway);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// gateway/list
app.get("/gateways", async (req, res) => {
  try {
    res.json(await Gateway.find().lean());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// gateway/update
app.patch("/gateways/:id", async (req, res) => {
  try {
    const gateway = await Gateway.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    }).lean();
    if (!gateway) return res.status(404).json({ error: "Gateway not found" });
    res.json(gateway);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// gateway/delete
app.delete("/gateways/:id", async (req, res) => {
  try {
    await Gateway.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Plants ---
// plant/create
app.post("/plants", async (req, res) => {
  const { gatewayId, name, thresholds } = req.body;
  try {
    const plant = await Plant.create({ gatewayId, name, thresholds });
    res.json(plant);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// plant/get
app.get("/plants/:id", async (req, res) => {
  try {
    const plant = await Plant.findById(req.params.id).lean();
    if (!plant) return res.status(404).json({ error: "Plant not found" });
    res.json(plant);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// plant/list — filter by gatewayId query param: GET /plants?gatewayId=xxx
app.get("/plants", async (req, res) => {
  const filter = req.query.gatewayId ? { gatewayId: req.query.gatewayId } : {};
  try {
    res.json(await Plant.find(filter).lean());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// plant/update
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

// plant/delete
app.delete("/plants/:id", async (req, res) => {
  try {
    await Plant.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Measurements ---
// measurement/create — authenticated gateway only
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

// measurement/list — optionally filter by gatewayId: GET /measurements?gatewayId=xxx
app.get("/measurements", async (req, res) => {
  const filter = req.query.gatewayId ? { gatewayId: req.query.gatewayId } : {};
  try {
    const measurements = await Measurement.find(filter)
      .sort({ timestamp: -1 })
      .limit(50)
      .lean();
    res.json(measurements);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// measurement/deleteOld — deletes measurements older than retentionDays (default 30)
app.delete("/measurements/old", async (req, res) => {
  const retentionDays = parseInt(req.query.days) || 30;
  const cutoff = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);
  try {
    const result = await Measurement.deleteMany({ timestamp: { $lt: cutoff } });
    res.json({ deleted: result.deletedCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Alerts ---
// alert/list — active by default, add ?resolved=true for all
app.get("/alerts", async (req, res) => {
  const filter = req.query.resolved === "true" ? {} : { isResolved: false };
  try {
    const alerts = await Alert.find(filter).sort({ timestamp: -1 }).lean();
    res.json(alerts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// alert/update — e.g. mark as resolved: PATCH /alerts/:id { isResolved: true }
app.patch("/alerts/:id", async (req, res) => {
  try {
    const alert = await Alert.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    }).lean();
    if (!alert) return res.status(404).json({ error: "Alert not found" });
    res.json(alert);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
