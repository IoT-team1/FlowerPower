const express = require("express");
const router = express.Router();
const GatewayAbl = require("../abl/gateway-abl");

// Routes for Gateway management
router.post("/", GatewayAbl.create);          // Register a new gateway
router.post("/login", GatewayAbl.login);      // Authenticate device and get token
router.get("/:id", GatewayAbl.get);           // Get gateway details

module.exports = router;