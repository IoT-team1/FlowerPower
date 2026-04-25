const express = require("express");
const router = express.Router();
const GatewayAbl = require("../abl/gateway-abl");

// Routes for Gateway management
router.post("/", GatewayAbl.create);          // Register a new gateway
router.post("/login", GatewayAbl.login);      // Authenticate device and get token
router.get("/", GatewayAbl.list);             // List all gateways
router.get("/:id", GatewayAbl.get);           // Get gateway details
router.patch("/:id", GatewayAbl.update);      // Update gateway metadata or status
router.delete("/:id", GatewayAbl.delete);     // Remove a gateway from the system

module.exports = router;