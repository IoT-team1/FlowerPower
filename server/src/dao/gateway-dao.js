const Gateway = require("../models/gatewayModel");

const GatewayDao = {
  // Create a new gateway record in the database
  async create(gatewayData) {
    const newGateway = new Gateway(gatewayData);
    return await newGateway.save();
  },

  // Retrieve a single gateway by its ID
  async get(id) {
    return await Gateway.findById(id);
  },

  // List all gateways with an optional filter
  async list(filter) {
    return await Gateway.find(filter);
  },

  // Update gateway data using PATCH logic (find and update)
  async update(id, updateData) {
    return await Gateway.findByIdAndUpdate(id, updateData, { new: true });
  },

  // Completely remove a gateway from the database
  async remove(id) {
    return await Gateway.findByIdAndDelete(id);
  }
};

module.exports = GatewayDao;