const Alert = require("../models/alertModel");

const AlertDao = {
  // Create a new notification/alert
  async create(alertData) {
    const newAlert = new Alert(alertData);
    return await newAlert.save();
  },

  // List alerts sorted by newest first
  async list(filter) {
    return await Alert.find(filter).sort({ timestamp: -1 });
  },

  // Find a specific alert by ID
  async get(id) {
    return await Alert.findById(id);
  },

  // Update alert status (e.g., mark as resolved)
  async update(id, updateData) {
    return await Alert.findByIdAndUpdate(id, updateData, { new: true });
  }
};

module.exports = AlertDao;