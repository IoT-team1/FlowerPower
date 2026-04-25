const GatewayDao = require("../dao/gateway-dao");
const { v4: uuidv4 } = require("uuid");
const crypto = require("crypto");

const GatewayAbl = {
  async create(req, res) {
    try {
      const { name } = req.body;
      if (!name) return res.status(400).json({ error: "invalidDtoIn", message: "Name is required" });

      const device_secret = uuidv4();
      const newGateway = await GatewayDao.create({ name, device_secret, status: "offline" });

      res.status(201).json({
        id: newGateway._id,
        name: newGateway.name,
        device_secret: newGateway.device_secret,
        status: newGateway.status
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async login(req, res) {
    try {
      const { id, device_secret } = req.body;
      if (!id || !device_secret) return res.status(400).json({ error: "invalidDtoIn" });

      const gateway = await GatewayDao.get(id);
      if (!gateway) return res.status(404).json({ error: "gatewayDoesNotExist" });

      if (gateway.device_secret !== device_secret) {
        return res.status(401).json({ error: "unauthorizedDevice" });
      }

      const accessToken = crypto.randomBytes(32).toString("hex");

      await GatewayDao.update(id, { 
        accessToken, 
        status: "online", 
        lastSync: new Date() 
      });

      res.status(200).json({ accessToken });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async get(req, res) {
    try {
      const { id } = req.params; // ID from URL
      const gateway = await GatewayDao.get(id);
      if (!gateway) return res.status(404).json({ error: "gatewayDoesNotExist" });

      res.status(200).json({
        id: gateway._id,
        name: gateway.name,
        status: gateway.status,
        lastSync: gateway.lastSync,
        accessToken: gateway.accessToken
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async list(req, res) {
    try {
      const gateways = await GatewayDao.list({});
      res.status(200).json(gateways);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async update(req, res) {
    try {
      const { id } = req.params; // ID from URL
      const { name, status } = req.body;

      const gateway = await GatewayDao.get(id);
      if (!gateway) return res.status(404).json({ error: "gatewayDoesNotExist" });

      const updatedGateway = await GatewayDao.update(id, { name, status });
      res.status(200).json(updatedGateway);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async delete(req, res) {
    try {
      const { id } = req.params; // ID from URL
      const gateway = await GatewayDao.get(id);
      if (!gateway) return res.status(404).json({ error: "gatewayDoesNotExist" });

      await GatewayDao.remove(id);
      res.status(200).json({ message: "Gateway deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = GatewayAbl;