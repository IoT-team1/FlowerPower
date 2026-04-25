const PlantDao = require("../dao/plant-dao");
const GatewayDao = require("../dao/gateway-dao");

const PlantAbl = {
  async create(req, res) {
    try {
      const { gatewayId, name, thresholds } = req.body;
      
      const gateway = await GatewayDao.get(gatewayId);
      if (!gateway) return res.status(404).json({ error: "gatewayDoesNotExist" });

      if (thresholds.minTemp >= thresholds.maxTemp || thresholds.minHum >= thresholds.maxHum) {
        return res.status(400).json({ error: "invalidLimits", message: "Min values cannot be >= Max values" });
      }

      const newPlant = await PlantDao.create({ gatewayId, name, thresholds });
      res.status(201).json(newPlant);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async list(req, res) {
    try {
      const { gatewayId } = req.query; 
      const filter = gatewayId ? { gatewayId } : {};
      
      const plants = await PlantDao.list(filter);
      res.status(200).json(plants);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async get(req, res) {
    try {
      const { id } = req.params; // ID from URL
      const plant = await PlantDao.get(id);
      if (!plant) return res.status(404).json({ error: "plantDoesNotExist" });
      res.status(200).json(plant);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async update(req, res) {
    try {
      const { id } = req.params; // ID from URL
      const { name, thresholds } = req.body;

      const plant = await PlantDao.get(id);
      if (!plant) return res.status(404).json({ error: "plantDoesNotExist" });

      const updatedPlant = await PlantDao.update(id, { name, thresholds });
      res.status(200).json(updatedPlant);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async delete(req, res) {
    try {
      const { id } = req.params; // ID from URL
      const plant = await PlantDao.get(id);
      if (!plant) return res.status(404).json({ error: "plantDoesNotExist" });

      await PlantDao.remove(id);
      res.status(200).json({ id, message: "Plant deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = PlantAbl;