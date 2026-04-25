const mongoose = require("mongoose");

const alertSchema = new mongoose.Schema({
  // Reference to the plant that triggered the alert
  plantId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Plant", 
    required: true 
  },
  
  // Detailed message describing the issue
  message: { type: String, required: true },
  
  // Severity classification of the notification
  level: { type: String, enum: ["warning", "critical"], default: "warning" },
  
  // Suggested action for the user to resolve the issue
  recommendation: { type: String },
  
  // Time when the alert was generated
  timestamp: { type: Date, default: Date.now },
  
  // Tracking whether the user has acknowledged the issue
  isResolved: { type: Boolean, default: false }
});

// Index to speed up retrieval of recent alerts for specific plants
alertSchema.index({ plantId: 1, timestamp: -1 });

module.exports = mongoose.model("Alert", alertSchema);