const Alert = require("../models/alertModel");

const AlertDao = {
  async create(alertData) {
    const newAlert = new Alert(alertData);
    return await newAlert.save();
  },
  async list(filter) {
    return await Alert.find(filter).sort({ timestamp: -1 });
  },
  async get(id) {
    return await Alert.findById(id);
  },
  async update(id, updateData) {
    return await Alert.findByIdAndUpdate(id, updateData, { new: true });
  }
};

module.exports = AlertDao;