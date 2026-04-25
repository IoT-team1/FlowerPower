const Plant = require("../models/plantModel");

const PlantDao = {
  async create(plantData) {
    const newPlant = new Plant(plantData);
    return await newPlant.save();
  },
  async list(filter) {
    return await Plant.find(filter);
  }
};

module.exports = PlantDao;