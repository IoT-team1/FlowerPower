const Plant = require("../models/plantModel");

const PlantDao = {
  // Save a new plant profile to the database
  async create(plantData) {
    const newPlant = new Plant(plantData);
    return await newPlant.save();
  },

  // Retrieve a list of plants, optionally filtered by gatewayId
  async list(filter) {
    return await Plant.find(filter);
  },

  // Get detailed information about a specific plant
  async get(id) {
    return await Plant.findById(id);
  },

  // Update plant metadata or thresholds
  async update(id, updateData) {
    return await Plant.findByIdAndUpdate(id, updateData, { new: true });
  },

  // Delete a plant profile from the database
  async remove(id) {
    return await Plant.findByIdAndDelete(id);
  }
};

module.exports = PlantDao;