const mongoose = require("mongoose");
require("dotenv").config();

mongoose.connect(process.env.MONGODB_URI).then(() => {
  console.log("Connected to MongoDB");
});

const gatewaySchema = new mongoose.Schema({
  name: { type: String, required: true },
  apiKey: { type: String, required: true, unique: true },
  status: { type: String, enum: ["online", "offline"], default: "offline" },
  lastSync: { type: Date },
});

const measurementSchema = new mongoose.Schema({
  gatewayId: { type: mongoose.Schema.Types.ObjectId, ref: "Gateway", required: true },
  temperature: { type: Number },
  humidity: { type: Number },
  timestamp: { type: Date, required: true },
});

measurementSchema.index({ gatewayId: 1, timestamp: -1 });

const plantSchema = new mongoose.Schema({
  gatewayId: { type: mongoose.Schema.Types.ObjectId, ref: "Gateway", required: true },
  name: { type: String, required: true },
  thresholds: {
    minTemp: { type: Number, required: true },
    maxTemp: { type: Number, required: true },
    minHum: { type: Number, required: true },
    maxHum: { type: Number, required: true },
  },
});

const alertSchema = new mongoose.Schema({
  plantId: { type: mongoose.Schema.Types.ObjectId, ref: "Plant", required: true },
  message: { type: String, required: true },
  level: { type: String, enum: ["warning", "critical"], required: true },
  recommendation: { type: String },
  timestamp: { type: Date, default: Date.now },
  isResolved: { type: Boolean, default: false },
});

alertSchema.index({ plantId: 1, timestamp: -1 });

const Gateway = mongoose.model("Gateway", gatewaySchema);
const Measurement = mongoose.model("Measurement", measurementSchema);
const Plant = mongoose.model("Plant", plantSchema);
const Alert = mongoose.model("Alert", alertSchema);

module.exports = { Gateway, Measurement, Plant, Alert };
