const Gateway = require("../models/gatewayModel");

const GatewayDao = {
  async create(gatewayData) {
    const newGateway = new Gateway(gatewayData);
    return await newGateway.save();
  },
  async get(id) {
    return await Gateway.findById(id);
  },
  async update(id, updateData) {
    return await Gateway.findByIdAndUpdate(id, updateData, { new: true });
  }
};

module.exports = GatewayDao;