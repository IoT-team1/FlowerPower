const mongoose = require("mongoose");
require("dotenv").config();

/**
 * Function to establish connection to MongoDB.
 * The connection string is loaded from the .env file.
 */
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    // Exit process with failure
    process.exit(1);
  }
};

module.exports = connectDB;