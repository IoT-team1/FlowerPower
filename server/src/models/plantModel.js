const mongoose = require("mongoose");

const plantSchema = new mongoose.Schema({
  // Link to the physical gateway monitoring this specific plant
  gatewayId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Gateway", 
    required: true 
  },
  
  // User-defined name for the plant
  name: { type: String, required: true },
  
  // Critical environmental limits for plant health
  thresholds: {
    minTemp: { type: Number, required: true },
    maxTemp: { type: Number, required: true },
    minHum: { type: Number, required: true },
    maxHum: { type: Number, required: true }
  }
});

module.exports = mongoose.model("Plant", plantSchema);