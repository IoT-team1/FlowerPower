const express = require("express");
const router = express.Router();
const MeasurementAbl = require("../abl/measurement-abl");
const verifyToken = require("../middleware/auth");

// Routes for Measurement data
router.post("/", verifyToken, MeasurementAbl.create); // Protected route for hardware
router.get("/", MeasurementAbl.list);                 // List measurements for charts
router.delete("/old", MeasurementAbl.deleteOld);      // Delete measurements older than X days

module.exports = router;