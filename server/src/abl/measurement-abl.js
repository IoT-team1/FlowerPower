const MeasurementDao = require("../dao/measurement-dao");
const PlantDao = require("../dao/plant-dao");
const AlertDao = require("../dao/alert-dao");
const GatewayDao = require("../dao/gateway-dao");
const SseManager = require("../sevises/sseManager");

const MeasurementAbl = {
  async create(req, res) {
    try {
      // const plantId = req.plantId;
      const gatewayId = req.gatewayId;
      const { plantId, temperature, humidity } = req.body;

      // 1. Save measurement via DAO
      await MeasurementDao.create({ plantId, temperature, humidity });

      // 2. Get gatewayId from plant based on plantId
      // const gatewayId = (await PlantDao.get(plantId)).gatewayId;

      // 3. Update gateway status via DAO
      await GatewayDao.update(gatewayId, { lastSync: new Date(), status: "online" });

      // 4. Check thresholds and create alerts
      const plant = await PlantDao.get(plantId);
      if (!plant) return res.status(404).json({ error: 'plantNotFound' });

      let alertsCreated = 0;

      const { minTemp, maxTemp, minHum, maxHum } = plant.thresholds;
      const alerts = [];

      if (temperature < minTemp)
        alerts.push(`Temperature is too low (${temperature}°C).`);
      else if (temperature > maxTemp)
        alerts.push(`Temperature is too high (${temperature}°C).`);

      if (humidity < minHum)
        alerts.push(`Soil moisture is too low (${humidity}%).`);
      else if (humidity > maxHum)
        alerts.push(`Soil moisture is too high (${humidity}%).`);

      for (const alertMessage of alerts) {
        const alert = await AlertDao.create({
          plantId: plant._id,
          plantName: plant.name,
          message: alertMessage,
          level: 'warning',
        });

        SseManager.broadcast('alert', {
          _id: alert._id,
          plantId: plant._id,
          plantName: plant.name,
          message: alertMessage,
          level: 'warning',
          isResolved: false,
          timestamp: new Date(),
        });

        alertsCreated++;
      }


      res.status(201).json({ 
        message: "Measurement saved successfully", 
        alertsTriggered: alertsCreated 
      });

    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async list(req, res) {
    try {
      // Filtering based on gatewayID - uncomment below if needed
      // const { gatewayId } = req.query;
      // const filter = gatewayId ? { gatewayId } : {};

      // Filtering based on plantId
      const { plantId } = req.query;
      const filter = plantId ? { plantId } : {};

      const measurements = await MeasurementDao.list(filter);
      res.status(200).json(measurements);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async deleteOld(req, res) {
    try {
      const days = req.body.days || 30; // Default to 30 days if not provided
      const dateLimit = new Date();
      dateLimit.setDate(dateLimit.getDate() - days);

      const result = await MeasurementDao.deleteOld(dateLimit);
      res.status(200).json({ 
        count: result.deletedCount, 
        message: "Old measurements deleted successfully" 
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = MeasurementAbl;