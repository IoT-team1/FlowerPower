const MeasurementDao = require("../dao/measurement-dao");
const PlantDao = require("../dao/plant-dao");
const AlertDao = require("../dao/alert-dao");
const GatewayDao = require("../dao/gateway-dao");

const MeasurementAbl = {
  async create(req, res) {
    try {
      const gatewayId = req.gatewayId; 
      const { temperature, humidity } = req.body;

      // 1. Uložení měření přes DAO
      await MeasurementDao.create({ gatewayId, temperature, humidity });

      // 2. Aktualizace stavu brány přes DAO
      await GatewayDao.update(gatewayId, { lastSync: new Date(), status: "online" });

      // 3. Kontrola limitů a vytváření alertů
      const plants = await PlantDao.list({ gatewayId });
      let alertsCreated = 0;

      for (const plant of plants) {
        const { minTemp, maxTemp, minHum, maxHum } = plant.thresholds;
        let alertMessage = null;

        if (temperature < minTemp) alertMessage = `Temperature is too low (${temperature}°C).`;
        else if (temperature > maxTemp) alertMessage = `Temperature is too high (${temperature}°C).`;
        else if (humidity < minHum) alertMessage = `Soil moisture is too low (${humidity}%).`;
        else if (humidity > maxHum) alertMessage = `Soil moisture is too high (${humidity}%).`;

        if (alertMessage) {
          await AlertDao.create({
            plantId: plant._id,
            message: alertMessage,
            level: "warning"
          });
          alertsCreated++;
        }
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
      const { gatewayId } = req.query;
      const filter = gatewayId ? { gatewayId } : {};
      
      const measurements = await MeasurementDao.list(filter);
      res.status(200).json(measurements);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = MeasurementAbl;