// FlowerPower DB Seed
// Run once to seed a fresh MongoDB database:
//   node server/init-db.js
// Set MONGODB_URI in server/.env before running.

require("dotenv").config();
const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");
const { Gateway, Measurement, Plant, Alert } = require("./db");

async function seed() {
  const gateway = await Gateway.create({
    name: "RPi Gateway 1",
    apiKey: uuidv4(),
    status: "online",
    lastSync: new Date(),
  });

  const now = new Date();
  await Measurement.insertMany([
    { gatewayId: gateway._id, temperature: 22.5, humidity: 58.3, timestamp: now },
    { gatewayId: gateway._id, temperature: 23.1, humidity: 57.1, timestamp: new Date(now - 5 * 60 * 1000) },
    { gatewayId: gateway._id, temperature: 21.8, humidity: 60.2, timestamp: new Date(now - 10 * 60 * 1000) },
  ]);

  const plant = await Plant.create({
    gatewayId: gateway._id,
    name: "Ficus",
    thresholds: { minTemp: 18, maxTemp: 28, minHum: 40, maxHum: 70 },
  });

  await Alert.create({
    plantId: plant._id,
    message: "Humidity below minimum threshold",
    level: "warning",
    recommendation: "Water the plant",
    isResolved: false,
  });

  console.log("Seed complete");
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
