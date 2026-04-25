const mongoose = require("mongoose");

const gatewaySchema = new mongoose.Schema({
  // Human-readable name of the gateway
  name: { type: String, required: true },
  
  // Permanent secret key, must be unique across the system
  device_secret: { type: String, required: true, unique: true },
  
  // Temporary token generated upon successful login
  accessToken: { type: String, default: null },
  
  // Operational status restricted to specific values
  status: { type: String, enum: ["online", "offline", "error"], default: "offline" },
  
  // Last time the gateway communicated with the server
  lastSync: { type: Date, default: null }
});

module.exports = mongoose.model("Gateway", gatewaySchema);