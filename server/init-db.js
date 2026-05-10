
/**
 * Test database initialization, need to edit .env file to 'test' and run in /server 'node init-db.js'
 */

require("dotenv").config();
const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");
const fs = require("node:fs");
const path = require("node:path");

const connectDB = require("./db");
const Gateway = require("./src/models/gatewayModel");
const Measurement = require("./src/models/measurementModel");
const Plant = require("./src/models/plantModel");

const seedData = JSON.parse(
  fs.readFileSync(path.join(__dirname, "seed-data.json"), "utf-8")
);
// helper: random number
const rand = (min, max) => Math.random() * (max - min) + min;

// helper: random date in range
function randomDate(from, to) {
  return new Date(from.getTime() + Math.random() * (to.getTime() - from.getTime()));
}

// generate measurement
function createMeasurement(gatewayId, plantId, timestamp) {
  return {
    gatewayId,
    plantId,
    temperature: parseFloat(rand(12, 35).toFixed(1)),
    humidity: parseFloat(rand(30, 90).toFixed(1)),
    moisture: parseFloat(rand(10, 90).toFixed(1)),
    timestamp
  };
}

// generator per plant
function generateMeasurements(gatewayId, plantId) {
  const now = new Date();

  const last100min = 100 * 60 * 1000;
  const last24h = 24 * 60 * 60 * 1000;
  const last7d = 7 * 24 * 60 * 60 * 1000;
  const last30d = 30 * 24 * 60 * 60 * 1000;

  const measurements = [];

  // 10 last 7 days
  for (let i = 0; i < 10; i++) {
    measurements.push(
      createMeasurement(
        gatewayId,
        plantId,
        randomDate(new Date(now - last7d), now)
      )
    );
  }

  // 10 last 24 hours
  for (let i = 0; i < 10; i++) {
    measurements.push(
      createMeasurement(
        gatewayId,
        plantId,
        randomDate(new Date(now - last24h), now)
      )
    );
  }

  // 20 last 30 days
  for (let i = 0; i < 20; i++) {
    measurements.push(
      createMeasurement(
        gatewayId,
        plantId,
        randomDate(new Date(now - last30d), now)
      )
    );
  }

  // 10 last 100 minutes
  for (let i = 0; i < 10; i++) {
    measurements.push(
      createMeasurement(
        gatewayId,
        plantId,
        randomDate(new Date(now - last100min), now)
      )
    );
  }

  return measurements;
}

async function seed() {
  await connectDB();

  await mongoose.connection.db.dropDatabase();

  // Gateway
  const gateway = await Gateway.create({
    name: seedData.gateway.name,
    device_secret: uuidv4(),
    status: "online",
    lastSync: new Date()
  });

  // Plants + measurements
  const allMeasurements = [];

  for (const plantData of seedData.plants) {
    const plant = await Plant.create({
      gatewayId: gateway._id,
      name: plantData.name,
      thresholds: plantData.thresholds
    });

    const measurements = generateMeasurements(gateway._id, plant._id);
    allMeasurements.push(...measurements);
  }

  // bulk insert
  await Measurement.insertMany(allMeasurements);

  console.log(
    `Seed complete: 1 gateway, ${seedData.plants.length} plants, ${allMeasurements.length} measurements`
  );

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});

/**
 * Old database initialization

// FlowerPower DB Seed
require("dotenv").config();
const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");
const connectDB = require("./db");
const Gateway = require("./src/models/gatewayModel");
const Measurement = require("./src/models/measurementModel");
const Plant = require("./src/models/plantModel");
const Alert = require("./src/models/alertModel");

async function seed() {
  await connectDB();
  let gateway = await Gateway.create({
    name: "RPi Gateway 1",
    device_secret: uuidv4(),
    status: "online",
    lastSync: new Date(),
  });


  const now = new Date();
  await Measurement.insertMany([
    {
      gatewayId: gateway._id,
      temperature: 22.5,
      humidity: 58.3,
      timestamp: now,
    },
    {
      gatewayId: gateway._id,
      temperature: 23.1,
      humidity: 57.1,
      timestamp: new Date(now - 5 * 60 * 1000),
    },
    {
      gatewayId: gateway._id,
      temperature: 21.8,
      humidity: 60.2,
      timestamp: new Date(now - 10 * 60 * 1000),
    },
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

 */
