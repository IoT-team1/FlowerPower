const Measurement = require("../models/measurementModel");

const MeasurementDao = {
  async create(measurementData) {
    const newMeasurement = new Measurement(measurementData);
    return await newMeasurement.save();
  },
  async list(filter, limit = 100) {
    return await Measurement.find(filter).sort({ timestamp: -1 }).limit(limit);
  }
};

module.exports = MeasurementDao;