const Measurement = require("../models/measurementModel");

const MeasurementDao = {
  // Store a new sensor reading
  async create(measurementData) {
    const newMeasurement = new Measurement(measurementData);
    return await newMeasurement.save();
  },

  // List measurements with filter and limit to prevent database overload
  async list(filter, limit = 100) {
    return await Measurement.find(filter).sort({ timestamp: -1 }).limit(limit);
  },

  // Bulk delete measurements older than the provided date limit
  async deleteOld(dateLimit) {
    return await Measurement.deleteMany({ timestamp: { $lt: dateLimit } });
  }
};

module.exports = MeasurementDao;