const mongoose = require("mongoose");

const measurementSchema = new mongoose.Schema({
  // Reference to the Gateway that submitted the reading
  gatewayId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Gateway", 
    required: true 
  },
  
  // Environmental data captured by sensors
  temperature: { type: Number, required: true },
  humidity: { type: Number, required: true }, 
  
  // Timestamp of when the measurement was recorded
  timestamp: { type: Date, default: Date.now }
});

// Index to optimize queries filtering by gateway and sorted by time
measurementSchema.index({ gatewayId: 1, timestamp: -1 });

module.exports = mongoose.model("Measurement", measurementSchema);