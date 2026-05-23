const MeasurementDao = require("../dao/measurement-dao");
const PlantDao = require("../dao/plant-dao");
const AlertDao = require("../dao/alert-dao");
const GatewayDao = require("../dao/gateway-dao");
const SseManager = require("../sevises/sseManager");

const MeasurementAbl = {
  async create(req, res) {
    try {
      const gatewayId = req.gatewayId;
      // 1. Načtení dat z requestu (včetně případného timestampu z historie)
      const { plantId, temperature, humidity, moisture, timestamp } = req.body;

      // Rozpoznání, zda jde o historická data z cache brány
      const isHistoricalData = !!timestamp;
      const measurementDate = timestamp ? new Date(timestamp) : new Date();

      // 2. Každé měření (i historické) se VŽDY uloží se správným časem pro plynulé grafy
      await MeasurementDao.create({ 
        gatewayId, 
        plantId, 
        temperature, 
        humidity, 
        moisture, 
        timestamp: measurementDate 
      });

      // Aktualizace stavu brány (lastSync dává smysl nechat na reálném času spojení)
      await GatewayDao.update(gatewayId, { lastSync: new Date(), status: "online" });

      // 3. KONTROLA LIMITŮ A ALERTY - Spustí se POUZE pro aktuální (živá) data
      // Stará měření z dřívějška tuto sekci úplně přeskočí (neukládají se do DB a nevysílají přes SSE)
      if (!isHistoricalData) {
        const plant = await PlantDao.get(plantId);
        if (!plant) return res.status(404).json({ error: 'plantNotFound' });

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
          // Vytvoření živého alertu v databázi
          const alert = await AlertDao.create({
            plantId: plant._id,
            plantName: plant.name,
            message: item.msg,
            recommendation: item.rec,
            level: 'warning',
          });

          // Okamžité odeslání na frontend přes SSE stream
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
      }

      res.status(201).json({ 
        message: "Measurement processed successfully" 
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