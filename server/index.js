const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./db");

const app = express();

// Middleware configuration
app.use(cors());
app.use(express.json());

// Initialize database connection
connectDB();

// Import route modules
const gatewayRoutes = require("./src/routes/gatewayRoutes");
const plantRoutes = require("./src/routes/plantRoutes");
const measurementRoutes = require("./src/routes/measurementRoutes");
const alertRoutes = require("./src/routes/alertRoutes");

// Register API routes
app.use("/gateways", gatewayRoutes);
app.use("/plants", plantRoutes);
app.use("/measurements", measurementRoutes);
app.use("/alerts", alertRoutes);

// Basic health check endpoints
app.get("/", (req, res) => res.json({ status: "ok" }));
app.get("/ping", (req, res) => res.send("ok"));

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});