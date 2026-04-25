const express = require("express");
const router = express.Router();
const AlertAbl = require("../abl/alert-abl");

// Routes for Alert management
router.get("/", AlertAbl.list);               // List alerts (can filter by ?resolved=true)
router.patch("/:id", AlertAbl.update);        // Mark an alert as resolved

module.exports = router;