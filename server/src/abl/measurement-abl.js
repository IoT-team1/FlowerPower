const MeasurementDao = require("../dao/measurement-dao");
const PlantDao = require("../dao/plant-dao");
const AlertDao = require("../dao/alert-dao");
const GatewayDao = require("../dao/gateway-dao");
const SseManager = require("../sevises/sseManager");

const MeasurementAbl = {
  async create(req, res) {
    try {
      const gatewayId = req.gatewayId;
      // 1. KROK OPRAVY: Vytáhneme timestamp z req.body (pokud ho brána posílá)
      const { plantId, temperature, humidity, moisture, timestamp } = req.body;

      // Poznáme, zda jde o historická data (pokud timestamp v req.body existuje)
      const isHistoricalData = !!timestamp;
      const measurementDate = timestamp ? new Date(timestamp) : new Date();

      // 2. KROK OPRAVY: Uložíme měření se správným časem (historickým nebo aktuálním)
      await MeasurementDao.create({ 
        gatewayId, 
        plantId, 
        temperature, 
        humidity, 
        moisture, 
        timestamp: measurementDate 
      });

      // Update gateway status via DAO
      await GatewayDao.update(gatewayId, { lastSync: new Date(), status: "online" });

      // Check thresholds and create alerts
      const plant = await PlantDao.get(plantId);
      if (!plant) return res.status(404).json({ error: 'plantNotFound' });

      let alertsCreated = 0;
      const { minTemp, maxTemp, minHum, maxHum, minMoist, maxMoist } = plant.thresholds;
      
      const alertTriggers = [];

      if (temperature < minTemp)
        alertTriggers.push({ msg: `Teplota je příliš nízká (${temperature}°C).`, rec: "Zkuste rostlinu přesunout na teplejší místo." });
      else if (temperature > maxTemp)
        alertTriggers.push({ msg: `Teplota je příliš vysoká (${temperature}°C).`, rec: "Ochlaďte místnost větráním nebo rostlinu přesuňte do stínu." });

      if (moisture < minMoist)
        alertTriggers.push({ msg: `Vlhkost půdy je příliš nízká (${moisture}%).`, rec: "Rostlina má žízeň! Doporučujeme ji ihned zalít odstátou vodou." });
      else if (moisture > maxMoist)
        alertTriggers.push({ msg: `Vlhkost půdy je příliš vysoká (${moisture}%).`, rec: "Půda je přemokřená. Omezte zálivku, aby neuhnily kořeny." });

      if (humidity < minHum)
        alertTriggers.push({ msg: `Vlhkost vzduchu je příliš nízká (${humidity}%).`, rec: "Vzduch je suchý. Doporučujeme rostlinu rosit rozprašovačem." });
      else if (humidity > maxHum)
        alertTriggers.push({ msg: `Vlhkost vzduchu je příliš vysoká (${humidity}%).`, rec: "Vlhkost vzduchu je příliš vysoká. Doporučujeme vyvětrat." });

      for (const item of alertTriggers) {
        // 3. KROK OPRAVY: Uložíme alert do DB s reálným časem incidentu
        const alert = await AlertDao.create({
          plantId: plant._id,
          plantName: plant.name,
          message: item.msg,
          recommendation: item.rec,
          level: 'warning',
          timestamp: measurementDate // Uloží se správný historický čas
        });

        // 4. KROK OPRAVY: Klíčová podmínka! 
        // Pokud jsou data z historie (isHistoricalData === true), přeskočíme vysílání na frontend.
        // Alert se pošle do prohlížeče JEN tehdy, když se to děje reálně TEĎ zaživa.
        if (!isHistoricalData) {
          SseManager.broadcast('alert', {
            _id: alert._id,
            plantId: plant._id,
            plantName: plant.name,
            message: item.msg,
            recommendation: item.rec,
            level: 'warning',
            isResolved: false,
            timestamp: measurementDate,
          });
        }

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
      const days = req.body.days || 30;
      const dateLimit = new Date();
      dateLimit.setDate(dateLimit.getDate() - days);
      const result = await MeasurementDao.deleteOld(dateLimit);
      res.status(200).json({ count: result.deletedCount, message: "Old measurements deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = MeasurementAbl;