const express = require("express");
const router = express.Router();
const PlantAbl = require("../abl/plant-abl");

// Routes for Plant management
router.post("/", PlantAbl.create);            // Create a new plant profile
router.get("/", PlantAbl.list);               // List all plants (can filter by ?gatewayId=)

module.exports = router;